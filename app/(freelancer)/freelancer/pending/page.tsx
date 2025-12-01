import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { freelancerProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Clock, Mail, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function FreelancerPendingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const profile = await db.query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, userId),
  })

  if (!profile) {
    redirect('/freelancer/onboarding')
  }

  // If verified, redirect to dashboard
  if (profile.verificationStatus === 'verified') {
    redirect('/freelancer')
  }

  // Get user email from Clerk
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const userEmail = user.emailAddresses[0]?.emailAddress || 'your email'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Under Review
              </h1>
              <p className="text-sm text-gray-600">
                Thank you, {profile.name}! ✨
              </p>
            </div>

            {/* Message */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed">
                We&apos;re reviewing your profile to ensure platform quality. This typically takes <span className="font-semibold text-gray-900">12-24 hours</span>.
              </p>
              <p className="text-xs text-gray-500">
                We&apos;ll email you at <span className="font-medium text-blue-600">{userEmail}</span>
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">While you wait</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link 
                href="/freelancer"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
              >
                <Eye className="w-4 h-4" />
                Browse Available Jobs
              </Link>
              
              <a 
                href="mailto:support@hfree.com" 
                className="inline-flex items-center justify-center gap-2 w-full bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm hover:shadow"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

