'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Briefcase,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  CheckCheck,
  XCircle,
  ArrowRight,
  Package,
  ArrowLeft,
  Shield,
  Award
} from 'lucide-react'
import { format } from 'date-fns'
import { withdrawApplication } from '@/lib/actions/freelancer'
import { useRouter } from 'next/navigation'
import { getJobTypeLabel, JobType } from '@/lib/constants/job-types'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Application {
  id: string
  status: 'interested' | 'not_interested'
  message: string | null
  proposedPrice: string | null
  createdAt: Date
  job: {
    id: string
    title: string
    description: string
    budget: string | null
    location: string
    jobTypes: JobType[]
    dates: Array<{ date: string }>
    isActive: boolean
    contractContentPosting: boolean | null
    contractAdvancePayment: boolean | null
    contractPaymentAfterShot: boolean | null
    contractContentOwnership: boolean | null
    contractSdCard: boolean | null
    contractAdditionalDetails: string | null
    company: {
      id: string
      companyProfile: {
        companyName: string
      } | null
    }
    bookingRequests: Array<{
      id: string
      status: 'pending' | 'accepted' | 'rejected' | 'completed'
      createdAt: Date
      updatedAt: Date
    }>
  }
}

interface ApplicationDetailsProps {
  application: Application
}

// Helper function to get application status
function getApplicationStatus(application: Application) {
  const booking = application.job.bookingRequests[0]
  
  if (!booking) {
    return {
      label: 'Under Review',
      color: 'blue',
      icon: Clock,
      description: 'Your application is being reviewed by the company'
    }
  }
  
  switch (booking.status) {
    case 'pending':
      return {
        label: 'Booking Sent',
        color: 'amber',
        icon: Package,
        description: 'Company sent you a booking request',
        bookingId: booking.id
      }
    case 'accepted':
      return {
        label: 'Booking Accepted',
        color: 'green',
        icon: CheckCheck,
        description: 'You accepted the booking request',
        bookingId: booking.id
      }
    case 'rejected':
      return {
        label: 'Booking Declined',
        color: 'red',
        icon: XCircle,
        description: 'You declined the booking request',
        bookingId: booking.id
      }
    case 'completed':
      return {
        label: 'Completed',
        color: 'purple',
        icon: CheckCircle2,
        description: 'Job completed successfully',
        bookingId: booking.id
      }
  }
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  const router = useRouter()
  const [withdrawing, setWithdrawing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  
  const status = getApplicationStatus(application)
  const StatusIcon = status.icon
  const jobInactive = !application.job.isActive
  const canWithdraw = !jobInactive && application.job.bookingRequests.length === 0

  const handleWithdraw = async () => {
    setWithdrawing(true)
    try {
      await withdrawApplication(application.id)
      router.push('/freelancer/applications')
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to withdraw application'
      alert(errorMessage)
      setWithdrawing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 md:py-6">
      <div className="px-0 sm:px-6 lg:px-8 space-y-6">
        {/* Header Card */}
        <Card className="rounded-none sm:rounded-lg border-t-4 border-t-blue-600 border-x-0 sm:border-x shadow-none sm:shadow-lg">
          <CardHeader className="space-y-3">
            {/* Back Button and Status Badge */}
            <div className="flex items-center justify-between gap-3">
              <Link href="/freelancer/applications">
                <Button variant="ghost" size="sm" className="gap-2 -ml-2 hover:bg-gray-100 text-gray-600">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Applications</span>
                </Button>
              </Link>
              <Badge className={`${
                status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                status.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                status.color === 'green' ? 'bg-green-100 text-green-800' :
                status.color === 'red' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              } flex items-center gap-1.5 px-3 py-1`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            </div>

            <div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-1">
                  {application.job.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="font-medium">
                    {application.job.company.companyProfile?.companyName || 'Company'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {application.job.jobTypes.map((type) => (
                <Badge key={type} variant="secondary" className="px-3 py-1">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {getJobTypeLabel(type)}
                </Badge>
              ))}
              {jobInactive && (
                <Badge variant="secondary" className="px-3 py-1">Closed</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Job Description */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Job Description
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {application.job.description}
              </p>
            </div>

            {/* Job Details Grid */}
            <div>
              <h2 className="font-semibold text-lg mb-2 text-gray-900">Key Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-blue-700 font-medium">Location</p>
                    <p className="font-semibold text-gray-900 text-sm wrap-break-word">
                      {application.job.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-green-700 font-medium">Job Budget</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {application.job.budget}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Dates */}
            <div>
              <h2 className="font-semibold text-lg mb-1 text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Available Dates
              </h2>
              <div className="flex flex-wrap gap-2">
                {application.job.dates.map((dateObj, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="px-3 py-2 text-sm font-medium"
                  >
                    {format(new Date(dateObj.date), 'MMM d, yyyy')}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Contract Terms */}
            {(application.job.contractContentPosting || 
              application.job.contractAdvancePayment || 
              application.job.contractPaymentAfterShot || 
              application.job.contractContentOwnership || 
              application.job.contractSdCard) && (
              <div className="border-t pt-4">
                <h2 className="font-semibold text-lg mb-2 text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Contract Terms
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {application.job.contractContentPosting && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-gray-900">Content Posting Rights</span>
                    </div>
                  )}
                  {application.job.contractAdvancePayment && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-gray-900">Advance Payment</span>
                    </div>
                  )}
                  {application.job.contractPaymentAfterShot && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-gray-900">Payment After Shot</span>
                    </div>
                  )}
                  {application.job.contractContentOwnership && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-gray-900">Content Ownership</span>
                    </div>
                  )}
                  {application.job.contractSdCard && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-gray-900">SD Card Handover</span>
                    </div>
                  )}
                </div>
                {application.job.contractAdditionalDetails && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Additional Details</p>
                    <p className="text-sm text-gray-700">{application.job.contractAdditionalDetails}</p>
                  </div>
                )}
              </div>
            )}

            {/* Application History */}
            <div className="border-t pt-4">
              <h2 className="font-semibold text-lg mb-2 text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Application History
              </h2>
              <div className="space-y-4">
                {/* Application Submitted */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    {application.job.bookingRequests.length > 0 && (
                      <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900">Application Submitted</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(application.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Your application was successfully submitted to {application.job.company.companyProfile?.companyName || 'the company'}
                    </p>
                  </div>
                </div>

                {/* Booking Request Status */}
                {application.job.bookingRequests.length > 0 && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        status.color === 'amber' ? 'bg-amber-600' :
                        status.color === 'green' ? 'bg-green-600' :
                        status.color === 'red' ? 'bg-red-600' :
                        'bg-purple-600'
                      }`}>
                        <StatusIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{status.label}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(application.job.bookingRequests[0].createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{status.description}</p>
                      
                      {status.bookingId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          asChild
                        >
                          <Link href="/freelancer/bookings">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            View Booking Details
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Under Review State */}
                {application.job.bookingRequests.length === 0 && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      {status.description}. You&apos;ll be notified if the company sends you a booking request.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Your Application Details */}
            <div className="border-t pt-4">
              <h2 className="font-semibold text-lg mb-2 text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Your Application Details
              </h2>
              <div className="space-y-4">
                {/* Your Proposed Budget */}
                {application.proposedPrice && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-900 mb-1">Your Proposed Budget</p>
                    <p className="text-2xl font-bold text-amber-800">{application.proposedPrice}</p>
                  </div>
                )}

                {/* Your Message */}
                {application.message && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Your Message</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">{application.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                  asChild
                >
                  <Link href={`/freelancer/jobs/${application.job.id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Job Posting
                  </Link>
                </Button>
                
                {canWithdraw && (
                  <Button
                    variant="destructive"
                    className="flex-1 sm:flex-initial"
                    onClick={() => setConfirmOpen(true)}
                    disabled={withdrawing}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                  </Button>
                )}
              </div>

              {/* Info messages */}
              {jobInactive && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg mt-4">
                  <AlertCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    This job is no longer active. You cannot withdraw your application.
                  </p>
                </div>
              )}

              {!jobInactive && application.job.bookingRequests.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    You cannot withdraw this application because a booking request has been sent. Please respond to the booking request or contact the company.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action cannot be undone and you&apos;ll need to reapply if you change your mind.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWithdraw}
              className="bg-red-600 hover:bg-red-700"
            >
              Withdraw Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
