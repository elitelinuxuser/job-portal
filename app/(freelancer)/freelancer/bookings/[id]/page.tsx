import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { bookingRequests } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  IndianRupee, 
  Building2,
  CheckCircle2, 
  XCircle, 
  FileText,
  Camera,
  Shield,
  ArrowLeft
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { getJobTypeLabel } from '@/lib/constants/job-types'
import { AcceptBookingSheet } from '@/components/freelancer/accept-booking-sheet'
import { RejectBookingSheet } from '@/components/freelancer/reject-booking-sheet'
import { RequestPaymentSheet } from '@/components/freelancer/request-payment-sheet'
import { BookingPaymentHistory } from '@/components/freelancer/booking-payment-history'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        icon: Clock,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      }
    case 'accepted':
      return {
        label: 'Accepted',
        icon: CheckCircle2,
        badgeClass: 'bg-green-100 text-green-800 border-green-300',
      }
    case 'completed':
      return {
        label: 'Completed',
        icon: FileText,
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        icon: XCircle,
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
      }
    default:
      return {
        label: 'Unknown',
        icon: Clock,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
      }
  }
}

export default async function FreelancerBookingDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  const { id } = await params

  const booking = await db.query.bookingRequests.findFirst({
    where: and(
      eq(bookingRequests.id, id),
      eq(bookingRequests.freelancerId, userId)
    ),
    with: {
      job: true,
      company: {
        with: {
          companyProfile: true,
        },
      },
      payments: true,
    },
  })

  if (!booking) {
    notFound()
  }

  const companyProfile = booking.company.companyProfile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contract = booking.contractDetails as any
  const statusConfig = getStatusConfig(booking.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="max-w-5xl mx-auto pb-20 sm:pb-6">
      <div className="px-0 sm:px-6 lg:px-8 space-y-6">
        {/* Header Card */}
        <Card className="rounded-none sm:rounded-lg border-t-4 border-t-blue-600 border-x-0 sm:border-x shadow-none sm:shadow-lg">
          <CardHeader className="space-y-2">
            {/* Back Button */}
            <Link href="/freelancer/bookings">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 hover:bg-gray-100 text-gray-600">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Bookings</span>
              </Button>
            </Link>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
              {contract.title || booking.job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge className={`${statusConfig.badgeClass} px-3 py-1`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {contract.jobTypes?.[0] && (
                <Badge variant="secondary" className="px-3 py-1">
                  <Camera className="w-3 h-3 mr-1" />
                  {getJobTypeLabel(contract.jobTypes[0])}
                </Badge>
              )}
              {contract.dates && contract.dates.length > 0 && (
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {contract.dates.length} event(s)
                </Badge>
              )}
              <Badge className="bg-linear-to-r from-green-600 to-emerald-600 text-white px-3 py-1">
                <IndianRupee className="w-3 h-3 mr-1" />
                {contract.budget}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Company Section */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900">Company Information</h2>
              <Link href={`/company/profile/${booking.companyId}`}>
                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
                  {companyProfile?.logoUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shrink-0">
                      <Image
                        src={companyProfile.logoUrl}
                        alt={companyProfile?.companyName || 'Company'}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{companyProfile?.companyName || 'Company'}</p>
                    </div>
                    {(booking.status === "accepted" || booking.status === "completed") && companyProfile?.whatsappNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{companyProfile.whatsappNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Job Details */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900">Job Details</h2>
              <Link href={`/freelancer/jobs/${booking.job.id}`}>
                <p className="text-base font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2 mb-2">
                  {booking.job.title}
                </p>
              </Link>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">{booking.job.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contract.location && (
                  <div className="flex items-center gap-3 p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="text-purple-700 font-medium">Location</p>
                      <p className="font-semibold text-gray-900">{contract.location}</p>
                    </div>
                  </div>
                )}

                {contract.jobTypes?.[0] && (
                  <div className="flex items-center gap-3 p-4 bg-linear-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="text-indigo-700 font-medium">Job Type</p>
                      <p className="font-semibold text-gray-900">{getJobTypeLabel(contract.jobTypes[0])}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Dates */}
            {contract.dates && contract.dates.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3 text-gray-900">Scheduled Events</h2>
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {contract.dates.map((dateObj: any, idx: number) => {
                    const dateStr = typeof dateObj === 'string' ? dateObj : dateObj.date
                    const formattedDate = format(new Date(dateStr), 'MMMM d, yyyy')
                    
                    // Format time with AM/PM
                    let timeDisplay = ''
                    if (dateObj.startTime) {
                      const [hours, minutes] = dateObj.startTime.split(':')
                      const hour = parseInt(hours)
                      const ampm = hour >= 12 ? 'PM' : 'AM'
                      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                      timeDisplay = `${displayHour}:${minutes} ${ampm}`
                      
                      if (dateObj.endTime) {
                        const [endHours, endMinutes] = dateObj.endTime.split(':')
                        const endHour = parseInt(endHours)
                        const endAmpm = endHour >= 12 ? 'PM' : 'AM'
                        const endDisplayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
                        timeDisplay += ` - ${endDisplayHour}:${endMinutes} ${endAmpm}`
                      }
                    }
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{formattedDate}</span>
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
            )}

            {/* Contract Terms */}
            <div className="border-t pt-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Contract Terms
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {contract.contractContentPosting && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Content Posting Rights</span>
                  </div>
                )}
                {contract.contractAdvancePayment && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Advance Payment</span>
                  </div>
                )}
                {contract.contractPaymentAfterShot && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Payment After Shot</span>
                  </div>
                )}
                {contract.contractContentOwnership && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">Content Ownership</span>
                  </div>
                )}
                {contract.contractSdCard && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">SD Card Handover</span>
                  </div>
                )}
              </div>
              {contract.contractAdditionalDetails && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Additional Details</p>
                  <p className="text-sm text-gray-700">{contract.contractAdditionalDetails}</p>
                </div>
              )}
            </div>

            {/* Payment Section */}
            {booking.payments.length > 0 && (
              <div id="payment-history" className="border-t pt-6 scroll-mt-20">
                <h2 className="font-semibold text-lg mb-3 text-gray-900">Payment History</h2>
                <BookingPaymentHistory payments={booking.payments} booking={booking} />
              </div>
            )}

            {/* Rejection Reason */}
            {booking.status === 'rejected' && booking.rejectionReason && (
              <div className="border-t pt-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-800">{booking.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Booking Date */}
            <div className="text-sm text-gray-500 pt-4 border-t">
              Booking request received on {format(new Date(booking.createdAt), 'MMMM d, yyyy')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Accept/Reject Actions - For Pending Bookings */}
      {booking.status === 'pending' && (
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:max-w-5xl sm:mx-auto sm:px-6 lg:px-8 z-50">
          <Card className="rounded-none sm:rounded-lg border-x-0 sm:border-x border-t sm:border-t shadow-lg backdrop-blur-sm bg-white/95 sm:bg-white p-0">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <RejectBookingSheet bookingId={booking.id} />
                <AcceptBookingSheet 
                  bookingId={booking.id}
                  budget={contract.budget}
                  companyName={companyProfile?.companyName || 'the company'}
                  contract={contract}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sticky Request Payment - For Accepted Bookings */}
      {booking.status === 'accepted' && (
        <>
          <div className="fixed bottom-0 left-0 right-0 sm:relative sm:max-w-5xl sm:mx-auto sm:px-6 lg:px-8 z-50">
            <Card className="rounded-none sm:rounded-lg border-x-0 sm:border-x border-t sm:border-t shadow-lg backdrop-blur-sm bg-white/95 sm:bg-white p-0">
              <CardContent className="p-4">
                <RequestPaymentSheet 
                  bookingId={booking.id}
                  budget={contract.budget}
                  companyName={companyProfile?.companyName || 'the company'}
                  existingPayments={booking.payments}
                />
              </CardContent>
            </Card>
          </div>

          {/* Floating WhatsApp Button */}
          {companyProfile?.whatsappNumber && (
            <a
              href={`https://wa.me/${companyProfile.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="fixed bottom-24 right-6 sm:bottom-20 sm:right-8 w-14 h-14 bg-linear-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 z-40 group"
              aria-label="Contact on WhatsApp"
            >
              <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </a>
          )}
        </>
      )}
    </div>
  )
}
