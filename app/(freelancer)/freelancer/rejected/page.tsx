import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Mail, XCircle } from 'lucide-react'

export default async function FreelancerRejectedPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center">
                <XCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Not Approved
              </h1>
              <p className="text-sm text-gray-600">
                We&apos;re sorry, but your freelancer profile was not approved.
              </p>
            </div>

            {/* Message */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed">
                Unfortunately, we were unable to verify your profile information. This could be due to:
              </p>
              <ul className="text-sm text-gray-600 text-left space-y-1 ml-4">
                <li>• Incomplete or inaccurate information</li>
                <li>• Unable to verify ID proof</li>
                <li>• Profile details don&apos;t meet our criteria</li>
              </ul>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">Need help?</span>
              </div>
            </div>

            {/* Support Button */}
            <a
              href="mailto:support@hfree.com"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
            >
              <Mail className="w-4 h-4" />
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
