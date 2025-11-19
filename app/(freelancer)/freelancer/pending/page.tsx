import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, freelancerProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Clock, Mail, CheckCircle, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-yellow-100 p-4">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Profile Under Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700">
              Thank you for completing your profile, <span className="font-semibold">{profile.name}</span>!
            </p>
            <p className="text-gray-600">
              Your freelancer profile has been submitted for review. Our team is verifying your information to ensure the quality and authenticity of our platform.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900">Review Timeline</h3>
                <p className="text-sm text-blue-700">
                  This process typically takes up to 24 hours. We'll review your profile details and get back to you as soon as possible.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900">Email Notification</h3>
                <p className="text-sm text-blue-700">
                  You'll receive an email once your profile is approved.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900">Browse Jobs</h3>
                <p className="text-sm text-blue-700">
                  While waiting, you can browse available jobs. You'll be able to apply once your profile is approved.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900">What Happens Next?</h3>
                <p className="text-sm text-blue-700">
                  Once approved, you'll be able to apply for jobs and connect with companies looking for your skills.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Your Profile Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Name:</dt>
                <dd className="font-medium text-gray-900">{profile.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Location:</dt>
                <dd className="font-medium text-gray-900">{profile.location}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">WhatsApp:</dt>
                <dd className="font-medium text-gray-900">{profile.whatsappNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Status:</dt>
                <dd>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Approval
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex justify-center">
            <Link href="/freelancer">
              <Button variant="outline" size="lg">
                <Eye className="w-4 h-4 mr-2" />
                Browse Available Jobs
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            Need help? Contact us at support@yourplatform.com
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

