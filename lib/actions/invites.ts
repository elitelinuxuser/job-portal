'use server'

import { db } from '@/lib/db'
import { invites, users } from '@/lib/db/schema'
import { requireRole } from '@/lib/auth'
import { auth } from '@clerk/nextjs/server'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createInvite(role: 'admin' | 'company' | 'freelancer', expiresInDays?: number) {
  await requireRole('admin')
  
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Generate unique invite code
  const code = `${role}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null

  const [invite] = await db.insert(invites).values({
    code,
    role,
    createdBy: userId,
    expiresAt,
  }).returning()

  revalidatePath('/admin/invites')
  
  return { success: true, invite }
}

export async function getInvites() {
  await requireRole('admin')
  
  const allInvites = await db
    .select()
    .from(invites)
    .orderBy(desc(invites.createdAt))

  return allInvites
}

export async function getInviteByCode(code: string) {
  const [invite] = await db
    .select()
    .from(invites)
    .where(eq(invites.code, code))
    .limit(1)

  return invite
}

export async function markInviteAsUsed(inviteId: string, userId: string) {
  await db
    .update(invites)
    .set({
      status: 'accepted',
      usedAt: new Date(),
      usedBy: userId,
    })
    .where(eq(invites.id, inviteId))

  revalidatePath('/admin/invites')
}

export async function deleteInvite(inviteId: string) {
  await requireRole('admin')
  
  await db.delete(invites).where(eq(invites.id, inviteId))
  
  revalidatePath('/admin/invites')
  
  return { success: true }
}

