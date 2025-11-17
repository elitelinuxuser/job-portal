'use server'

import { db } from '@/lib/db'
import { companyProfiles, users } from '@/lib/db/schema'
import { requireRole, updateUserMetadata } from '@/lib/auth'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createCompanyProfile(data: {
  companyName: string
  contactPersonName: string
  whatsappNumber: string
  location: string
  startedIn?: number
  logoUrl?: string
}) {
  await requireRole('company')
  
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    // Check if user exists in database
    let userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    // If user doesn't exist (webhook might not have fired in dev), create it
    if (!userExists) {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      
      await db.insert(users).values({
        id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        role: (clerkUser.publicMetadata?.role as 'admin' | 'company' | 'freelancer') || 'company',
        onboardingStatus: 'incomplete',
      })
    }

    // Create company profile
    const [profile] = await db.insert(companyProfiles).values({
      userId,
      ...data,
    }).returning()

    // Update user onboarding status
    await db
      .update(users)
      .set({
        onboardingStatus: 'complete',
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Update Clerk metadata
    await updateUserMetadata(userId, { onboardingStatus: 'complete' })

    revalidatePath('/company')
    
    return { success: true, profile }
  } catch (error) {
    console.error('Error creating company profile:', error)
    throw error
  }
}

export async function getCompanyProfile() {
  await requireRole('company')
  
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const profile = await db.query.companyProfiles.findFirst({
    where: eq(companyProfiles.userId, userId),
  })

  return profile
}

export async function updateCompanyProfile(data: {
  companyName: string
  contactPersonName: string
  whatsappNumber: string
  location: string
  startedIn?: number
  logoUrl?: string
}) {
  await requireRole('company')
  
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const [profile] = await db
    .update(companyProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(companyProfiles.userId, userId))
    .returning()

  revalidatePath('/company')
  
  return { success: true, profile }
}

