import { getJobById, hasRespondedToJob } from '@/lib/actions/freelancer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RespondToJobForm } from '@/components/freelancer/respond-to-job-form'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Briefcase, Clock, Building } from 'lucide-react'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id)
  const hasResponded = await hasRespondedToJob(params.id)

  if (!job) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <Building className="w-4 h-4" />
                <span>{job.company.companyProfile?.companyName || 'Company'}</span>
              </div>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              ₹{job.budget}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{job.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Job Type</p>
                  <p className="font-medium">{job.jobType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium">{job.time}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Dates</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(job.dates as string[]).map((date, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm">
                    {date}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Contract Overview</h3>
              <div className="space-y-2">
                {job.contractContentPosting && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Content Posting Rights</span>
                  </div>
                )}
                {job.contractAdvancePayment && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Advance Payment</span>
                  </div>
                )}
                {job.contractPaymentAfterShot && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Payment After Shot</span>
                  </div>
                )}
                {job.contractContentOwnership && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">Content Ownership</span>
                  </div>
                )}
                {job.contractSdCard && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">SD Card Handover</span>
                  </div>
                )}
              </div>
              {job.contractAdditionalDetails && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Additional Details:</p>
                  <p className="text-sm text-gray-700">{job.contractAdditionalDetails}</p>
                </div>
              )}
            </div>

            {!hasResponded ? (
              <div className="pt-4 border-t">
                <RespondToJobForm jobId={job.id} />
              </div>
            ) : (
              <div className="pt-4 border-t">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-blue-800">You have already responded to this job</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

