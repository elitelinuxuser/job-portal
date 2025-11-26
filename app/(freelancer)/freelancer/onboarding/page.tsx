import { FreelancerOnboardingForm } from '@/components/freelancer/onboarding-form'
import { Card } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'

export default function FreelancerOnboarding() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
              <UserCircle className="w-7 h-7 md:w-10 md:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Complete Your Profile</h1>
              <p className="text-blue-100 text-sm md:text-base mt-1">
                Set up your profile to start receiving job opportunities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8 -mt-6 pb-6 md:pb-12">
        <Card className="rounded-none sm:rounded-lg shadow-none sm:shadow-xl border-x-0 sm:border-x border-2 mb-6 md:mb-0">
          <FreelancerOnboardingForm />
        </Card>
      </div>
    </div>
  )
}



