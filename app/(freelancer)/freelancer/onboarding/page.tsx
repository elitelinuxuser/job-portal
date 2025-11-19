import { FreelancerOnboardingForm } from '@/components/freelancer/onboarding-form'
import { Card } from '@/components/ui/card'

export default function FreelancerOnboarding() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Complete Your Profile</h1>
        <p className="text-gray-600 mt-2">
          Set up your freelancer profile to start receiving job opportunities
        </p>
      </div>

      <Card className="p-6">
        <FreelancerOnboardingForm />
      </Card>
    </div>
  )
}



