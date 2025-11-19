import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'
import { cache } from 'react'

// Cache the current user for the request lifetime
export const getCurrentUser = cache(async () => {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  return user
})

// Cache user role for the request lifetime - read from session claims instead of API
export const getUserRole = cache(async () => {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    return undefined
  }
  
  // Try to get role from session claims first (faster)
  const roleFromClaims = sessionClaims?.publicMetadata?.role as string | undefined
  if (roleFromClaims) {
    return roleFromClaims
  }
  
  // Fallback to Clerk API if not in session (rare case)
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  
  return user.publicMetadata?.role as string | undefined
})

export async function updateUserMetadata(userId: string, metadata: Record<string, any>) {
  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: metadata,
  })
}

export const requireRole = cache(async (role: 'admin' | 'company' | 'freelancer') => {
  const userRole = await getUserRole()
  
  if (userRole !== role) {
    throw new Error('Unauthorized')
  }
})

