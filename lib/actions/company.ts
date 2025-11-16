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

