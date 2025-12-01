import { JobPostForm } from '@/components/company/job-post-form'
import { Card } from '@/components/ui/card'
import { getCompanyProfile } from '@/lib/actions/company'
import { redirect } from 'next/navigation'
import { Briefcase, Sparkles } from 'lucide-react'

export default async function PostJobPage() {
  const profile = await getCompanyProfile()

  // Redirect to pending page if not verified
  if (profile && profile.verificationStatus === 'pending') {
    redirect('/company/pending')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-6 md:py-12">
      <div className="max-w-3xl mx-auto px-0 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8 text-center px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg mb-3 md:mb-4">
            <Briefcase className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 md:mb-3">
            Post a New Job
          </h1>
          <p className="text-base md:text-lg text-gray-600 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            Create a job posting to find the perfect freelancer
          </p>
        </div>

        {/* Form Card */}
        <Card className="rounded-none sm:rounded-lg p-4 sm:p-6 md:p-8 shadow-none sm:shadow-xl border-t-4 border-t-blue-600 border-x-0 sm:border-x mb-6 md:mb-0">
          <JobPostForm />
        </Card>
      </div>
    </div>
  )
}



