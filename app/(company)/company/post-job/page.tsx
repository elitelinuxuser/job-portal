import { JobPostForm } from '@/components/company/job-post-form'
import { Card } from '@/components/ui/card'

export default function PostJobPage() {
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



