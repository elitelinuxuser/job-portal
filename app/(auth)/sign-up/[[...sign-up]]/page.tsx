import { SignUp } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { invites } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>
}) {
  const params = await searchParams
  const inviteCode = params.invite

  // Check if user is already logged in
  const { userId } = await auth()
  if (userId && inviteCode) {
    // User is already logged in and trying to use an invite
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const existingRole = user.publicMetadata?.role as string | undefined

    if (existingRole) {
      // User already has a role - redirect them to their dashboard
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-8 bg-yellow-50 rounded-lg">
            <h1 className="text-2xl font-bold text-yellow-800">Already Registered</h1>
            <p className="mt-2 text-yellow-600">
              You already have an account. Invitation links are for new users only.
            </p>
            <p className="mt-4">
              <a href={`/${existingRole}`} className="text-blue-600 hover:underline">
                Go to your dashboard →
              </a>
            </p>
          </div>
        </div>
      )
    }
  }

  // If there's an invite code, validate it
  if (inviteCode) {
    const invite = await db.query.invites.findFirst({
      where: eq(invites.code, inviteCode),
    })

    // Check if invite is valid
    if (!invite) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-8 bg-red-50 rounded-lg">
            <h1 className="text-2xl font-bold text-red-800">Invalid Invite</h1>
            <p className="mt-2 text-red-600">
              This invitation link is invalid or has expired.
            </p>
          </div>
        </div>
      )
    }

    if (invite.status === 'accepted') {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-8 bg-yellow-50 rounded-lg">
            <h1 className="text-2xl font-bold text-yellow-800">Invite Already Used</h1>
            <p className="mt-2 text-yellow-600">
              This invitation has already been accepted.
            </p>
          </div>
        </div>
      )
    }

    if (invite.status === 'expired') {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-8 bg-red-50 rounded-lg">
            <h1 className="text-2xl font-bold text-red-800">Invite Expired</h1>
            <p className="mt-2 text-red-600">
              This invitation has expired.
            </p>
          </div>
        </div>
      )
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-8 bg-red-50 rounded-lg">
            <h1 className="text-2xl font-bold text-red-800">Invite Expired</h1>
            <p className="mt-2 text-red-600">
              This invitation link has expired.
            </p>
          </div>
        </div>
      )
    }
  }

  // If no invite code, don't allow signup (invite-only platform)
  if (!inviteCode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-50 rounded-lg">
          <h1 className="text-2xl font-bold">Invitation Required</h1>
          <p className="mt-2 text-gray-600">
            This platform is invite-only. Please use your invitation link to sign up.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp 
        fallbackRedirectUrl={`/api/post-signup?invite=${inviteCode}`}
      />
    </div>
  )
}

