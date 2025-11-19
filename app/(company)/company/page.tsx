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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Jobs</h1>
            <p className="text-gray-600 mt-1">Manage your job postings</p>
          </div>
          <Badge
            variant={profile.verificationStatus === 'verified' ? 'default' : 'secondary'}
            className={profile.verificationStatus === 'verified' ? 'bg-green-600' : 'bg-yellow-100 text-yellow-800'}
          >
            {profile.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending Approval'}
          </Badge>
        </div>
        <Link href="/company/post-job">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">No jobs posted yet</p>
            <Link href="/company/post-job">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription className="mt-2">{job.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.isActive ? 'default' : 'secondary'}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <ToggleJobStatus jobId={job.id} isActive={job.isActive} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{job.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Budget:</span>
                      <span className="ml-2 font-medium">₹{job.budget}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Job Type:</span>
                      <span className="ml-2 font-medium">{job.jobType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 font-medium">{job.time}</span>
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



