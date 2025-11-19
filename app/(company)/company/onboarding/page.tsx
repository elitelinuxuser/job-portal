import { OnboardingForm } from '@/components/company/onboarding-form'
import { Card } from '@/components/ui/card'

export default function CompanyOnboarding() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Freelancer Platform</h1>
        <p className="text-gray-600 mt-2">
          Let's set up your company profile to get started
        </p>
      </div>

      <Card className="p-6">
        <OnboardingForm />
      </Card>
    </div>
  )
}



