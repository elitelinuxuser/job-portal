import { getCompanyJobs } from '@/lib/actions/jobs'
import { ResponsesList } from '@/components/company/responses-list'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Briefcase } from 'lucide-react'
import type { JobResponseWithRelations } from '@/types/job-responses'

export default async function ResponsesPage() {
  const jobs = await getCompanyJobs()

  // Get all responses across all jobs
  const allResponses: JobResponseWithRelations[] = jobs.flatMap((job) =>
    job.responses.map((response) => ({
      ...response,
      job,
    }))
  )

  const interestedResponses = allResponses
    .filter((r) => r.status === 'interested')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header Section */}
      <section className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-bold mb-1">
                Job Responses
              </h1>
              <p className="text-indigo-100">
                Review and manage freelancer applications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-indigo-200 bg-indigo-50/50">
            <CardContent className="px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-indigo-600 mb-1">Total Responses</p>
                  <p className="text-2xl font-bold text-indigo-900">{interestedResponses.length}</p>
                </div>
                <FileText className="w-8 h-8 text-indigo-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-600 mb-1">Active Jobs</p>
                  <p className="text-2xl font-bold text-purple-900">{jobs.filter(j => j.isActive).length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Responses List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <ResponsesList responses={interestedResponses} />
      </div>
    </div>
  )
}

