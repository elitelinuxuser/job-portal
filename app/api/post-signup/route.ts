import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { invites } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    // Get the current user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // Get invite code from URL
    const searchParams = req.nextUrl.searchParams
    const inviteCode = searchParams.get('invite')

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'No invite code provided' },
        { status: 400 }
      )
    }

    // Look up the invite
    const invite = await db.query.invites.findFirst({
      where: eq(invites.code, inviteCode),
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 400 }
      )
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invite has already been used or expired' },
        { status: 400 }
      )
    }

    // Set the user's role metadata
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: invite.role,
        onboardingStatus: 'incomplete',
      },
    })

    // Mark invite as accepted
    await db
      .update(invites)
      .set({
        status: 'accepted',
        usedBy: userId,
        usedAt: new Date(),
      })
      .where(eq(invites.id, invite.id))

    // Redirect based on role
    let redirectUrl = '/'
    
    if (invite.role === 'company') {
      redirectUrl = '/company/onboarding'
    } else if (invite.role === 'freelancer') {
      redirectUrl = '/freelancer/onboarding'
    }

    return NextResponse.redirect(new URL(redirectUrl, req.url))
  } catch (error) {
    console.error('Error in post-signup:', error)
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    )
  }
}

