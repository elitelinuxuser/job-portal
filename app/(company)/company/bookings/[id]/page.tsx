import { notFound } from 'next/navigation'
import { getSelectedContractTerms } from '@/lib/constants/contract-terms'
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
  User, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Camera,
  Briefcase,
  Shield,
  ExternalLink,
  ArrowLeft,
  Globe
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { getJobTypeLabel } from '@/lib/constants/job-types'
import { UpdateBookingDialog } from '@/components/company/update-booking-dialog'
import { CompanyBookingPaymentHistory } from '@/components/company/company-booking-payment-history'
import { MakePaymentButton } from '@/components/company/make-payment-button'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        icon: Clock,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        iconClass: 'text-amber-600',
        bgClass: 'bg-amber-50'
      }
    case 'accepted':
      return {
        label: 'Accepted',
        icon: CheckCircle2,
        badgeClass: 'bg-green-100 text-green-800 border-green-300',
        iconClass: 'text-green-600',
        bgClass: 'bg-green-50'
      }
    case 'completed':
      return {
        label: 'Completed',
        icon: CheckCircle2,
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        iconClass: 'text-blue-600',
        bgClass: 'bg-blue-50'
      }
    case 'rejected':
      return {
        label: 'Rejected',
        icon: XCircle,
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        iconClass: 'text-red-600',
        bgClass: 'bg-red-50'
      }
    default:
      return {
        label: status,
        icon: FileText,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        iconClass: 'text-gray-600',
        bgClass: 'bg-gray-50'
      }
  }
}

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  const { id } = await params

  const booking = await db.query.bookingRequests.findFirst({
    where: and(
      eq(bookingRequests.id, id),
      eq(bookingRequests.companyId, userId)
    ),
    with: {
      job: true,
      freelancer: {
        with: {
          freelancerProfile: true,
        },
      },
      payments: true,
    },
  })

  if (!booking) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contract = booking.contractDetails as any
  const statusConfig = getStatusConfig(booking.status)
  const StatusIcon = statusConfig.icon
  const freelancerProfile = booking.freelancer.freelancerProfile

  return (
    <div className="max-w-5xl mx-auto pb-20 sm:pb-6">
      <div className="px-0 sm:px-6 lg:px-8 space-y-6">
        {/* Header Card */}
        <Card className="rounded-none sm:rounded-lg border-t-4 border-t-purple-600 border-x-0 sm:border-x shadow-none sm:shadow-lg">
          <CardHeader className="space-y-2">
            {/* Back Button */}
            <Link href="/company/bookings">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2 hover:bg-gray-100 text-gray-600">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Bookings</span>
              </Button>
            </Link>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
              Booking for {contract.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge className={`${statusConfig.badgeClass} px-3 py-1`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {contract.jobTypes?.[0] && (
                <Badge variant="secondary" className="px-3 py-1">
                  <Briefcase className="w-3 h-3 mr-1" />
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
            {/* Freelancer Section */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900">Freelancer Information</h2>
              <Link href={`/freelancer/profile/${booking.freelancerId}`}>
                <div className="flex items-center gap-3 p-4 bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-colors">
                  {freelancerProfile?.photoUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shrink-0">
                      <Image
                        src={freelancerProfile.photoUrl}
                        alt={freelancerProfile?.name || 'Freelancer'}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-linear-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{freelancerProfile?.name || 'Freelancer'}</p>
                      {freelancerProfile?.verificationStatus === 'verified' && (
                        <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <ExternalLink className="w-4 h-4 text-indigo-600 ml-auto" />
                    </div>
                    {freelancerProfile?.whatsappNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{freelancerProfile.whatsappNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* Equipment & Portfolio */}
              {((freelancerProfile?.equipmentList && (freelancerProfile.equipmentList as string[]).length > 0) ||
                (freelancerProfile?.portfolioLinks && (freelancerProfile.portfolioLinks as string[]).length > 0)) && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {freelancerProfile?.equipmentList && 
                   (freelancerProfile.equipmentList as string[]).length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium mb-2">Equipment</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(freelancerProfile.equipmentList as string[]).map((item, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs bg-white border border-gray-300 text-gray-700 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {freelancerProfile?.portfolioLinks &&
                   (freelancerProfile.portfolioLinks as string[]).length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium mb-2">Portfolio</p>
                      <div className="space-y-1.5">
                        {(freelancerProfile.portfolioLinks as string[]).map((link, idx) => {
                          // Extract domain from URL for cleaner display
                          let displayUrl = link
                          try {
                            const url = new URL(link)
                            displayUrl = url.hostname.replace('www.', '')
                          } catch {
                            // If URL parsing fails, use the original link
                            displayUrl = link.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
                          }
                          
                          return (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 truncate"
                            >
                              <Globe className="w-3 h-3 shrink-0" />
                              <span className="truncate">{displayUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Job Details */}
            <div>
              <h2 className="font-semibold text-lg mb-3 text-gray-900">Job Details</h2>
              <Link href={`/company/jobs/${booking.job.id}`}>
                <p className="text-base font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2 mb-2">
                  {booking.job.title}
                  <ExternalLink className="w-4 h-4" />
                </p>
              </Link>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">{booking.job.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contract.location && (
                  <div className="flex items-center gap-3 p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="text-blue-700 font-medium">Location</p>
                      <p className="font-semibold text-gray-900 wrap-break-word">{contract.location}</p>
                    </div>
                  </div>
                )}

                {contract.jobTypes?.[0] && (
                  <div className="flex items-center gap-3 p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="text-purple-700 font-medium">Job Type</p>
                      <p className="font-semibold text-gray-900">{getJobTypeLabel(contract.jobTypes[0])}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Dates */}
            {contract.dates && contract.dates.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                  Scheduled Events
                </h2>
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
                          <span className="font-medium text-gray-900">
                            {formattedDate}
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
            )}

            {/* Contract Terms */}
            <div className="border-t pt-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Contract Terms
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {getSelectedContractTerms(contract.contractTerms as string[] | null).map((term) => (
                  <div key={term.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{term.label}</span>
                  </div>
                ))}
              </div>
              {contract.contractAdditionalDetails && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Additional Details</p>
                  <p className="text-sm text-gray-700">{contract.contractAdditionalDetails}</p>
                </div>
              )}
            </div>

            {/* Payment Section */}
            {(booking.payments.length > 0 || booking.status === 'accepted') && (
              <div className="border-t pt-6">
                <h2 className="font-semibold text-lg mb-3 text-gray-900">
                  Payment History
                </h2>
                {booking.payments.length > 0 ? (
                  <CompanyBookingPaymentHistory payments={booking.payments} booking={booking} />
                ) : (
                  <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-sm text-gray-600">No payment transactions yet</p>
                    <p className="text-xs text-gray-500 mt-1">Use the &quot;Make Payment&quot; button below to initiate a payment</p>
                  </div>
                )}
              </div>
            )}

            {/* Posted Date */}
            <div className="text-sm text-gray-500 pt-4 border-t">
              Booking created on {format(new Date(booking.createdAt), 'MMMM d, yyyy')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Update Action - For Pending Bookings */}
      {booking.status === 'pending' && (
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:max-w-5xl sm:mx-auto sm:px-6 lg:px-8 z-50">
          <Card className="rounded-none sm:rounded-lg border-x-0 sm:border-x border-t sm:border-t shadow-lg sm:shadow-lg backdrop-blur-sm bg-white/95 sm:bg-white p-0">
            <CardContent className="p-4">
              <UpdateBookingDialog 
                bookingId={booking.id}
                currentBudget={contract.budget}
                freelancerName={freelancerProfile?.name || 'Freelancer'}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sticky Make Payment Button - For Accepted Bookings */}
      {booking.status === 'accepted' && (
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:max-w-5xl sm:mx-auto sm:px-6 lg:px-8 z-50">
          <Card className="rounded-none sm:rounded-lg border-x-0 sm:border-x border-t sm:border-t shadow-lg sm:shadow-lg backdrop-blur-sm bg-white/95 sm:bg-white p-0">
            <CardContent className="p-4">
              <MakePaymentButton
                bookingId={booking.id}
                totalAmount={parseFloat(contract.budget)}
                payments={booking.payments}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
