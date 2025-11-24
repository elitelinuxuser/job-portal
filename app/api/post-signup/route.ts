import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { invites, users } from '@/lib/db/schema'
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

    // Check if user already has a role (prevent role override for existing users)
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const existingRole = user.publicMetadata?.role as string | undefined

    if (existingRole) {
      return NextResponse.json(
        { error: 'You already have an account with a role assigned. This invite is for new users only.' },
        { status: 403 }
      )
    }

    // Set the user's role metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: invite.role,
        onboardingStatus: 'incomplete',
      },
    })

    // Ensure user exists in local database (webhook might not have fired yet)
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!existingUser) {
      // Get user email from Clerk
      const clerkUser = await client.users.getUser(userId)
      const email = clerkUser.emailAddresses[0]?.emailAddress

      if (!email) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        )
      }

      // Create user in local database
      await db.insert(users).values({
        id: userId,
        email,
        role: invite.role,
        onboardingStatus: 'incomplete',
      })
    }

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

