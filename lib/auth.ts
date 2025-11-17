import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  return user
}

export async function getUserRole() {
  const { userId } = await auth()
  
  if (!userId) {
    return undefined
  }
  
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  
  return user.publicMetadata?.role as string | undefined
}

export async function updateUserMetadata(userId: string, metadata: Record<string, any>) {
  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: metadata,
  })
}

export async function requireRole(role: 'admin' | 'company' | 'freelancer') {
  const userRole = await getUserRole()
  
  if (userRole !== role) {
    throw new Error('Unauthorized')
  }
}

