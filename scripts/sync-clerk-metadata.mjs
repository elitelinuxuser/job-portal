import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Now dynamically import the modules that need env vars
const { clerkClient } = await import('@clerk/nextjs/server')
const { db } = await import('../lib/db/index.ts')
const { users } = await import('../lib/db/schema.ts')

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

