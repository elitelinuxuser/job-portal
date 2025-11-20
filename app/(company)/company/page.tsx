import { getCompanyJobs } from '@/lib/actions/jobs'
import { getCompanyProfile } from '@/lib/actions/company'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ToggleJobStatus } from '@/components/company/toggle-job-status'
import { redirect } from 'next/navigation'

export default async function CompanyDashboard() {
  const profile = await getCompanyProfile()
  const jobs = await getCompanyJobs()

  if (!profile) {
    return null // Will redirect to onboarding via middleware
  }

  // Redirect to pending page if not verified
  if (profile.verificationStatus === 'pending') {
    redirect('/company/pending')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your job postings</p>
          </div>
          <Badge
            variant={profile.verificationStatus === 'verified' ? 'default' : 'secondary'}
            className={`${profile.verificationStatus === 'verified' ? 'bg-green-600' : 'bg-yellow-100 text-yellow-800'} w-fit`}
          >
            {profile.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending Approval'}
          </Badge>
        </div>
        <Link href="/company/post-job" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-gray-500 mb-4 text-center">No jobs posted yet</p>
            <Link href="/company/post-job" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg sm:text-xl">{job.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">{job.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={job.isActive ? 'default' : 'secondary'} className="bg-blue-600">
                      {job.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <ToggleJobStatus jobId={job.id} isActive={job.isActive} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Location:</span>
                      <span className="ml-0 sm:ml-2 font-medium">{job.location}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Budget:</span>
                      <span className="ml-0 sm:ml-2 font-medium text-green-600">₹{job.budget}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Job Type:</span>
                      <span className="ml-0 sm:ml-2 font-medium">{job.jobType}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-gray-600 text-xs sm:text-sm">Time:</span>
                      <span className="ml-0 sm:ml-2 font-medium">{job.time}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Dates:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(job.dates as string[]).map((date, idx) => (
                        <Badge key={idx} variant="outline">{date}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{job.responses.length}</span> responses
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/company/responses?job=${job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Responses
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}



