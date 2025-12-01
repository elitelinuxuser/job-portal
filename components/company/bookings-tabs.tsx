'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MarkAsPaidDialog } from '@/components/company/mark-as-paid-dialog'
import { format } from 'date-fns'
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
  DollarSign,
  Package
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getJobTypeLabel } from '@/lib/constants/job-types'

interface BookingsTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingBookings: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  acceptedBookings: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completedBookings: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rejectedBookings: any[]
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BookingCard = ({ booking }: { booking: any }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contract = booking.contractDetails as any
  const statusConfig = getStatusConfig(booking.status)
  const StatusIcon = statusConfig.icon
  const freelancerProfile = booking.freelancer.freelancerProfile

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-2">
      <CardContent className="p-0">
        {/* Header with Gradient */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Freelancer Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {freelancerProfile?.photoUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
                  <Image
                    src={freelancerProfile.photoUrl}
                    alt={freelancerProfile.name || 'Freelancer'}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/freelancer/profile/${booking.freelancerId}`}>
                  <h3 className="font-semibold text-white hover:text-white/90 transition-colors truncate">
                    {freelancerProfile?.name || 'Freelancer'}
                  </h3>
                </Link>
                <p className="text-white/80 text-sm truncate">{contract.title}</p>
              </div>
            </div>
            {/* Status Badge */}
            <Badge className={`shrink-0 ${statusConfig.badgeClass} font-semibold px-3 py-1`}>
              <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Budget */}
            <div className="flex items-center gap-2.5 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700 font-medium">Budget</p>
                <p className="font-bold text-green-900 truncate">₹{contract.budget}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2.5 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-indigo-700 font-medium">Location</p>
                <p className="font-semibold text-indigo-900 truncate">{contract.location}</p>
              </div>
            </div>

            {/* Job Type */}
            <div className="flex items-center gap-2.5 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-700 font-medium">Job Type</p>
                <p className="font-semibold text-purple-900 truncate">{getJobTypeLabel(contract.jobTypes?.[0] || contract.jobType)}</p>
              </div>
            </div>

            {/* Contact */}
            {freelancerProfile?.whatsappNumber && (
              <div className="flex items-center gap-2.5 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="w-9 h-9 bg-cyan-600 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-cyan-700 font-medium">WhatsApp</p>
                  <p className="font-semibold text-cyan-900 truncate">{freelancerProfile.whatsappNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          {contract.dates && contract.dates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <p className="text-sm font-semibold text-gray-900">Event Dates</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {contract.dates.map((dateObj: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-gray-50 text-gray-700 border-gray-300 px-2.5 py-1">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {typeof dateObj === 'string' ? dateObj : dateObj.date}
                    {dateObj.startTime && ` • ${dateObj.startTime}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Payment Section */}
          {booking.payments.length > 0 ? (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-900">Payment History</h4>
              </div>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {booking.payments.map((payment: any) => (
                  <div key={payment.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-green-900">₹{payment.amount}</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          Paid on {format(new Date(payment.paidAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white">Paid</Badge>
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-gray-700 mt-2">{payment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : booking.status === 'accepted' ? (
            <div className="pt-4 border-t">
              <MarkAsPaidDialog bookingId={booking.id} budget={contract.budget} />
            </div>
          ) : null}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Requested {format(new Date(booking.createdAt), 'MMM d, yyyy · h:mm a')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function BookingsTabs({ 
  pendingBookings, 
  acceptedBookings, 
  completedBookings, 
  rejectedBookings
}: BookingsTabsProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'completed' | 'rejected'>('accepted')

  const tabs = [
    { id: 'pending' as const, label: 'Pending', count: pendingBookings.length, bookings: pendingBookings },
    { id: 'accepted' as const, label: 'Accepted', count: acceptedBookings.length, bookings: acceptedBookings },
    { id: 'completed' as const, label: 'Completed', count: completedBookings.length, bookings: completedBookings },
    { id: 'rejected' as const, label: 'Rejected', count: rejectedBookings.length, bookings: rejectedBookings },
  ]

  const currentBookings = tabs.find(t => t.id === activeTab)?.bookings || []

  return (
    <>
      {/* Tab Buttons */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              <span className="text-sm">{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {currentBookings.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent>
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab} bookings
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' && 'Bookings awaiting freelancer response will appear here'}
                  {activeTab === 'accepted' && 'Confirmed bookings will appear here'}
                  {activeTab === 'completed' && 'Finished projects will appear here'}
                  {activeTab === 'rejected' && 'Declined bookings will appear here'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {currentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
