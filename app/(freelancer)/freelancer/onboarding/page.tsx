import { FreelancerOnboardingForm } from '@/components/freelancer/onboarding-form'
import { Card } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'

export default function FreelancerOnboarding() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Complete Your Profile</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Set up your profile to start receiving job opportunities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8 pb-6 md:pb-12">
          <FreelancerOnboardingForm />
      </div>
    </div>
  )
}



