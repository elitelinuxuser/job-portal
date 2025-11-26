import { getJobById, hasRespondedToJob, getMyJobResponse } from '@/lib/actions/freelancer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RespondToJobForm } from '@/components/freelancer/respond-to-job-form'
import { JobDetailsClient } from '@/components/freelancer/job-details-client'
import { notFound } from 'next/navigation'
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Building2,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Shield,
  Award,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJobById(id)
  const hasResponded = await hasRespondedToJob(id)
  const myResponse = hasResponded ? await getMyJobResponse(id) : null

  if (!job) {
    notFound()
  }

  return (
    <>
      <div className="max-w-5xl mx-auto pb-32 md:pb-6">
        <div className="px-0 sm:px-6 lg:px-8 space-y-6">
          {/* Header Card - Mobile Optimized */}
          <Card className="rounded-none sm:rounded-lg border-t-4 border-t-blue-600 border-x-0 sm:border-x shadow-none sm:shadow-lg">
            <CardHeader className="space-y-4 pb-4">
              {/* Back Button Integrated */}
              <Link href="/freelancer">
                <Button variant="ghost" size="sm" className="gap-2 -ml-2 hover:bg-gray-100 text-gray-600">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Jobs</span>
                </Button>
              </Link>

              <div className="space-y-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{job.company.companyProfile?.companyName || 'Company'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge variant="secondary" className="px-3 py-1">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {job.jobType}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {(job.dates as string[]).length} day(s)
                </Badge>
                {!hasResponded && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Open
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h2 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Job Description
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{job.description}</p>
              </div>

              {/* Job Details Grid - Mobile Responsive */}
              <div>
                <h2 className="font-semibold text-lg mb-3 text-gray-900">Key Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-blue-700 font-medium">Location</p>
                      <p className="font-semibold text-gray-900 truncate">{job.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-purple-700 font-medium">Time</p>
                      <p className="font-semibold text-gray-900 truncate">{job.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 sm:col-span-2 lg:col-span-1">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                      <IndianRupee className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-green-700 font-medium">Budget</p>
                      <p className="font-semibold text-gray-900">₹{job.budget}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates Section - Scrollable on Mobile */}
              <div>
                <h2 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Available Dates
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(job.dates as string[]).map((date, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="px-3 py-2 text-sm font-medium"
                    >
                      {format(new Date(date), 'MMM d, yyyy')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contract Terms */}
              <div className="border-t pt-6">
                <h2 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
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

              {/* Posted Date - Desktop Only */}
              <div className="hidden md:block text-sm text-gray-500 pt-4 border-t">
                Posted on {format(new Date(job.createdAt), 'MMMM d, yyyy')}
              </div>
            </CardContent>
          </Card>

          {/* Response Section - Desktop */}
          {!hasResponded ? (
            <Card className="hidden md:block rounded-none sm:rounded-lg border-x-0 sm:border-x shadow-none sm:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Apply for this Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RespondToJobForm jobId={job.id} originalBudget={job.budget} />
              </CardContent>
            </Card>
          ) : myResponse ? (
            <Card className="hidden md:block rounded-none sm:rounded-lg border-x-0 sm:border-x shadow-none sm:shadow-lg">
              <CardHeader className="bg-green-50 border-b border-green-200">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircle2 className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-xl">Your Application</CardTitle>
                    <p className="text-sm text-green-700 mt-1">Submitted on {format(new Date(myResponse.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Proposed Budget */}
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">Your Proposed Budget</p>
                    <p className="text-2xl font-bold text-green-800">₹{myResponse.proposedPrice}</p>
                  </div>
                </div>

                {/* Message */}
                {myResponse.message && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      Your Message
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{myResponse.message}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Mobile Apply - Bottom Sheet */}
      <JobDetailsClient 
        job={{ 
          id: job.id, 
          title: job.title, 
          budget: job.budget || '0'
        }} 
        hasResponded={hasResponded}
        myResponse={myResponse ? {
          proposedPrice: myResponse.proposedPrice,
          message: myResponse.message,
          createdAt: myResponse.createdAt
        } : null}
      />
    </>
  )
}

