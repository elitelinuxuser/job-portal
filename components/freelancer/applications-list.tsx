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
  Package
} from 'lucide-react'
import { format } from 'date-fns'
import { withdrawApplication } from '@/lib/actions/freelancer'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getJobTypeLabel, JobType } from '@/lib/constants/job-types'
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
    locationFormatted?: string | null
    jobTypes: JobType[]
    dates: Array<{ date: string }>
    isActive: boolean
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

interface ApplicationsListProps {
  applications: Application[]
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

export function ApplicationsList({ applications }: ApplicationsListProps) {
  const router = useRouter()
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  const handleWithdrawClick = (appId: string) => {
    setSelectedApp(appId)
    setConfirmOpen(true)
  }

  const handleWithdraw = async () => {
    if (!selectedApp) return
    
    setWithdrawingId(selectedApp)
    try {
      await withdrawApplication(selectedApp)
      router.refresh()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to withdraw application'
      alert(errorMessage)
    } finally {
      setWithdrawingId(null)
      setConfirmOpen(false)
      setSelectedApp(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {applications.map((application) => {
          const isWithdrawing = withdrawingId === application.id
          const jobInactive = !application.job.isActive
          const status = getApplicationStatus(application)
          const StatusIcon = status.icon
          
          return (
            <Card key={application.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">{application.job.title}</h3>
                      {jobInactive && (
                        <Badge variant="secondary" className="shrink-0">
                          Closed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span className="font-medium truncate">
                        {application.job.bookingRequests.length > 0 
                          ? (application.job.company.companyProfile?.companyName || 'Company')
                          : 'Verified Company'
                        }
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {application.job.jobTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {getJobTypeLabel(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 sm:items-end">
                    <Badge className={`w-fit ${
                      status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      status.color === 'amber' ? 'bg-amber-100 text-amber-800' :
                      status.color === 'green' ? 'bg-green-100 text-green-800' :
                      status.color === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Job Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-blue-700 font-medium">Location</p>
                      <p className="font-semibold text-gray-900 text-sm truncate">{application.job.locationFormatted || application.job.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                      <IndianRupee className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-green-700 font-medium">Job Budget</p>
                      <p className="font-semibold text-gray-900 text-sm">{application.job.budget}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-purple-700 font-medium">Dates</p>
                      <p className="font-semibold text-gray-900 text-sm">{application.job.dates.length} day(s)</p>
                    </div>
                  </div>
                </div>

                {/* Application History & Status */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Application History
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Application Submitted */}
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        {application.job.bookingRequests.length > 0 && (
                          <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="font-medium text-gray-900 text-sm">Application Submitted</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {format(new Date(application.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Your application was successfully submitted to the company
                        </p>
                      </div>
                    </div>

                    {/* Booking Request Status */}
                    {application.job.bookingRequests.length > 0 && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            status.color === 'amber' ? 'bg-amber-600' :
                            status.color === 'green' ? 'bg-green-600' :
                            status.color === 'red' ? 'bg-red-600' :
                            'bg-purple-600'
                          }`}>
                            <StatusIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{status.label}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {format(new Date(application.job.bookingRequests[0].createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{status.description}</p>
                          
                          {status.bookingId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 h-8 text-xs"
                              asChild
                            >
                              <Link href="/freelancer/bookings">
                                <ArrowRight className="w-3 h-3 mr-1" />
                                View Booking Details
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Under Review State */}
                    {application.job.bookingRequests.length === 0 && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
                        <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                          {status.description}. You&apos;ll be notified if the company sends you a booking request.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Your Proposal */}
                {application.proposedPrice && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-900 mb-1">Your Proposed Budget</p>
                    <p className="text-xl font-bold text-amber-800">{application.proposedPrice}</p>
                  </div>
                )}

                {/* Your Message */}
                {application.message && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-2">Your Message</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.message}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-initial"
                    asChild
                  >
                    <a href={`/freelancer/jobs/${application.job.id}`}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Job
                    </a>
                  </Button>
                  
                  {!jobInactive && application.job.bookingRequests.length === 0 && (
                    <Button
                      variant="destructive"
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleWithdrawClick(application.id)}
                      disabled={isWithdrawing}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                    </Button>
                  )}
                </div>

                {jobInactive && (
                  <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      This job is no longer active. You cannot withdraw your application.
                    </p>
                  </div>
                )}

                {!jobInactive && application.job.bookingRequests.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      You cannot withdraw this application because a booking request has been sent. Please respond to the booking request or contact the company.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
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
    </>
  )
}
