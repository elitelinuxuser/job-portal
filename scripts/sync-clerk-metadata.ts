import * as dotenv from 'dotenv'

// Load environment variables FIRST
dotenv.config({ path: '.env.local' })

import { clerkClient } from '@clerk/nextjs/server'
import { db } from '../lib/db'
import { users } from '../lib/db/schema'

async function syncMetadata() {
  try {
    console.log('Syncing Clerk metadata with database...')
    
    // Get all users from database
    const dbUsers = await db.select().from(users)
    console.log(`Found ${dbUsers.length} users in database`)
    
    const client = await clerkClient()
    
    // Update each user's Clerk metadata to match database
    for (const user of dbUsers) {
      console.log(`Updating user ${user.email}...`)
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          role: user.role,
          onboardingStatus: user.onboardingStatus,
        },
      })
      console.log(`  ✅ Set role=${user.role}, onboardingStatus=${user.onboardingStatus}`)
    }
    
    console.log('\n✅ Metadata sync complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Metadata sync error:', error)
    process.exit(1)
  }
}

syncMetadata()

