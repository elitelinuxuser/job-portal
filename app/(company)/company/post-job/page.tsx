import { JobPostForm } from '@/components/company/job-post-form'
import { Card } from '@/components/ui/card'
import { getCompanyProfile } from '@/lib/actions/company'
import { redirect } from 'next/navigation'

export default async function PostJobPage() {
  const profile = await getCompanyProfile()

  // Redirect to pending page if not verified
  if (profile && profile.verificationStatus === 'pending') {
    redirect('/company/pending')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Post a New Job</h1>
        <p className="text-gray-600 mt-2">
          Create a job posting to find the perfect freelancer
        </p>
      </div>

      <Card className="p-6">
        <JobPostForm />
      </Card>
    </div>
  )
}



