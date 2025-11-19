import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function GET() {
  try {
    // Get all users from database
    const dbUsers = await db.select().from(users)
    
    const client = await clerkClient()
    
    // Update each user's Clerk metadata to match database
    for (const user of dbUsers) {
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          role: user.role,
          onboardingStatus: user.onboardingStatus,
        },
      })
    }
    
    return NextResponse.json({
      success: true,
      message: `Synced metadata for ${dbUsers.length} users`,
    })
  } catch (error) {
    console.error('Metadata sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync metadata' },
      { status: 500 }
    )
  }
}



