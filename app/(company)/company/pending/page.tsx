import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, companyProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Clock, Mail, CheckCircle, Sparkles, Building2, ArrowRight, Phone } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default async function CompanyPendingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const profile = await db.query.companyProfiles.findFirst({
    where: eq(companyProfiles.userId, userId),
  })

  if (!profile) {
    redirect('/company/onboarding')
  }

  // If verified, redirect to dashboard
  if (profile.verificationStatus === 'verified') {
    redirect('/company')
  }

  // Get user email from Clerk
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const userEmail = user.emailAddresses[0]?.emailAddress || 'your email'

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-6 md:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full shadow-lg mb-3 md:mb-4 animate-pulse">
            <Clock className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 md:mb-3">
            Profile Under Review
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-semibold">
            Thank you, {profile.companyName}! ✨
          </p>
          <p className="text-base md:text-lg text-gray-600 mt-2">
            We&apos;re verifying your information to ensure platform quality
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-xl border-t-4 border-t-amber-600 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* What's Happening Section */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">What&apos;s Happening Now?</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Our team is carefully reviewing your company profile to ensure the authenticity and quality of the HFree platform. This helps us maintain a trusted community of companies and freelancers.
              </p>
            </div>

            {/* Next Steps Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Review Timeline</h3>
                <p className="text-sm text-gray-700">
                  Typically takes <span className="font-semibold">12-24 hours</span>. We&apos;ll review your details thoroughly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Email Notification</h3>
                <p className="text-sm text-gray-700 break-words">
                  We&apos;ll notify you at <span className="font-semibold">{userEmail}</span>
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Get Started</h3>
                <p className="text-sm text-gray-700">
                  Post jobs & connect with talented freelancers instantly!
                </p>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Your Profile Summary</h2>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-500 font-medium">Company Name</span>
                  <span className="text-base font-bold text-gray-900">{profile.companyName}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-500 font-medium">Contact Person</span>
                  <span className="text-base font-bold text-gray-900">{profile.contactPersonName}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-500 font-medium">Location</span>
                  <span className="text-base font-bold text-gray-900">{profile.location}</span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-500 font-medium">WhatsApp Number</span>
                  <span className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    {profile.whatsappNumber}
                  </span>
                </div>
                <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300">
                  <span className="text-sm text-gray-600 font-medium">Current Status</span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold bg-amber-200 text-amber-900 w-fit">
                    <Clock className="w-5 h-5" />
                    Pending Approval
                  </span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white text-center">
              <Mail className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-blue-50 mb-3">
                Have questions about the review process?
              </p>
              <a 
                href="mailto:support@hfree.com" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

