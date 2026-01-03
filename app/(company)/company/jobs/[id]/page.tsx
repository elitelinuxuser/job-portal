import { getJobPostById } from '@/lib/actions/jobs'
import { getSelectedContractTerms } from '@/lib/constants/contract-terms'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  CheckCircle2,
  Eye,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { getJobTypeLabel } from '@/lib/constants/job-types'
import { formatTimeRange } from '@/lib/utils/date-filters'
import { CompanyJobActions } from '@/components/company/company-job-actions'
import { LocationLink } from '@/components/shared/location-link'

export default async function CompanyJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJobPostById(id)

  if (!job) {
    notFound()
  }

  const responseCount = job.responses?.length || 0

  return (
    <div className="max-w-5xl mx-auto pb-20 sm:pb-6">
      <div className="px-0 sm:px-6 lg:px-8 space-y-6">
        {/* Header Card */}
        <Card className="rounded-none sm:rounded-lg border-t-4 border-t-indigo-600 border-x-0 sm:border-x shadow-none sm:shadow-lg">
          <CardHeader className="space-y-2">
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

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
              {job.title}
            </h1>

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
                  {getJobTypeLabel(jobType)}
                </Badge>
              ))}
              <Badge variant="outline" className="px-3 py-1">
                <Calendar className="w-3 h-3 mr-1" />
                {job.dates.length} event(s)
              </Badge>
              <Badge className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-3 py-1">
                <IndianRupee className="w-3 h-3 mr-1" />
                {parseFloat(job.budget || '0').toLocaleString('en-IN')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                Job Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{job.description}</p>
            </div>

            {/* Job Details Grid */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900">Key Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-blue-700 font-medium">Location</p>
                    <LocationLink
                      location={job.locationFormatted || job.location}
                      latitude={job.locationLatitude}
                      longitude={job.locationLongitude}
                      placeId={job.locationPlaceId}
                      className="font-semibold text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="text-indigo-700 font-medium">Responses</p>
                    <p className="font-semibold text-gray-900">{responseCount} application{responseCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                Scheduled Events
              </h2>
              <div className="space-y-2">
                {job.dates.map((entry, idx) => {
                  const timeDisplay = formatTimeRange(entry.startTime, entry.endTime)
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
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
                {getSelectedContractTerms(job.contractTerms as string[] | null).map((term) => (
                  <div key={term.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{term.label}</span>
                  </div>
                ))}
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

      </div>
      
      {/* Sticky Actions Card - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 sm:relative sm:max-w-5xl sm:mx-auto sm:px-6 lg:px-8 z-50">
        <Card className="rounded-none sm:rounded-lg border-x-0 sm:border-x border-t sm:border-t shadow-lg sm:shadow-lg backdrop-blur-sm bg-white/95 sm:bg-white p-0">
          <CardContent className="p-4">
            <Link href={`/company/responses?job=${job.id}`} className="block">
              <Button className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 text-base font-semibold">
                <Eye className="w-5 h-5 mr-2" />
                View {responseCount} Response{responseCount !== 1 ? 's' : ''}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
