import { getJobPostById } from '@/lib/actions/jobs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { 
  MapPin, 
  Briefcase, 
  ArrowLeft,
  Calendar,
  IndianRupee,
  Shield,
  Award,
  CheckCircle2,
  Eye,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { getJobTypeLabel } from '@/lib/constants/job-types'
import { formatTimeRange } from '@/lib/utils/date-filters'
import { CompanyJobActions } from '@/components/company/company-job-actions'

export default async function CompanyJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJobPostById(id)

  if (!job) {
    notFound()
  }

  const responseCount = job.responses?.length || 0

  return (
    <div className="max-w-5xl mx-auto pb-6">
      <div className="px-0 sm:px-6 lg:px-8 space-y-6">
        {/* Header Card */}
        <Card className="rounded-none sm:rounded-lg border-t-4 border-t-indigo-600 border-x-0 sm:border-x shadow-none sm:shadow-lg">
          <CardHeader className="space-y-4 pb-4">
            {/* Back Button */}
            <div className="flex items-center justify-between">
              <Link href="/company">
                <Button variant="ghost" size="sm" className="gap-2 -ml-2 hover:bg-gray-100 text-gray-600">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Jobs</span>
                </Button>
              </Link>
              
              {/* Actions Dropdown */}
              <CompanyJobActions jobId={job.id} isActive={job.isActive} />
            </div>

            <div className="space-y-3">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
                  {job.title}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge 
                variant={job.isActive ? 'default' : 'secondary'} 
                className={`${job.isActive ? 'bg-green-600' : 'bg-gray-400'} text-white px-3 py-1`}
              >
                {job.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {job.jobTypes.map((jobType) => (
                <Badge key={jobType} variant="secondary" className="px-3 py-1">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {getJobTypeLabel(jobType as any)}
                </Badge>
              ))}
              <Badge variant="outline" className="px-3 py-1">
                <Calendar className="w-3 h-3 mr-1" />
                {job.dates.length} event(s)
              </Badge>
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1">
                <IndianRupee className="w-3 h-3 mr-1" />
                {parseFloat(job.budget || '0').toLocaleString('en-IN')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Job Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{job.description}</p>
            </div>

            {/* Job Details Grid */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900">Key Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-blue-700 font-medium">Location</p>
                    <p className="font-semibold text-gray-900 truncate">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-indigo-700 font-medium">Responses</p>
                    <p className="font-semibold text-gray-900">{responseCount} application{responseCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Scheduled Events
              </h2>
              <div className="space-y-2">
                {job.dates.map((entry, idx) => {
                  const timeDisplay = formatTimeRange(entry.startTime, entry.endTime)
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {format(new Date(entry.date), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      {timeDisplay && (
                        <Badge variant="outline" className="text-xs">
                          {timeDisplay}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Contract Terms */}
            <div className="border-t pt-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Contract Terms
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {job.contractContentPosting && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Content Posting Rights</span>
                  </div>
                )}
                {job.contractAdvancePayment && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Advance Payment</span>
                  </div>
                )}
                {job.contractPaymentAfterShot && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Payment After Shot</span>
                  </div>
                )}
                {job.contractContentOwnership && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Content Ownership</span>
                  </div>
                )}
                {job.contractSdCard && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">SD Card Handover</span>
                  </div>
                )}
              </div>
              {job.contractAdditionalDetails && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Additional Details</p>
                  <p className="text-sm text-gray-700">{job.contractAdditionalDetails}</p>
                </div>
              )}
            </div>

            {/* Posted Date */}
            <div className="text-sm text-gray-500 pt-4 border-t">
              Posted on {format(new Date(job.createdAt), 'MMMM d, yyyy')}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="rounded-none sm:rounded-lg border-x-0 sm:border-x shadow-none sm:shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Manage Job</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/company/responses?job=${job.id}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View {responseCount} Response{responseCount !== 1 ? 's' : ''}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
