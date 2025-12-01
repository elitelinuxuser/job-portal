'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Package,
  Briefcase
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

interface FreelancerBookingsListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bookings: any[]
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        icon: Clock,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        iconClass: 'text-amber-600',
      }
    case 'accepted':
      return {
        label: 'Accepted',
        icon: CheckCircle2,
        badgeClass: 'bg-green-100 text-green-800 border-green-300',
        iconClass: 'text-green-600',
      }
    case 'completed':
      return {
        label: 'Completed',
        icon: CheckCircle2,
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        iconClass: 'text-blue-600',
      }
    case 'rejected':
      return {
        label: 'Rejected',
        icon: XCircle,
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        iconClass: 'text-red-600',
      }
    default:
      return {
        label: status,
        icon: FileText,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        iconClass: 'text-gray-600',
      }
  }
}

export function FreelancerBookingsList({ bookings }: FreelancerBookingsListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all')

  const pendingBookings = bookings.filter((b) => b.status === 'pending')
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted')
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const rejectedBookings = bookings.filter((b) => b.status === 'rejected')

  const tabs = [
    { id: 'all' as const, label: 'All', count: bookings.length, bookings: bookings },
    { id: 'pending' as const, label: 'Pending', count: pendingBookings.length, bookings: pendingBookings },
    { id: 'accepted' as const, label: 'Accepted', count: acceptedBookings.length, bookings: acceptedBookings },
    { id: 'completed' as const, label: 'Completed', count: completedBookings.length, bookings: completedBookings },
    { id: 'rejected' as const, label: 'Rejected', count: rejectedBookings.length, bookings: rejectedBookings },
  ]

  const currentBookings = tabs.find(t => t.id === activeTab)?.bookings || []

  if (bookings.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent>
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Bookings Yet
            </h3>
            <p className="text-gray-600">
              Booking requests from companies will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Tabs */}
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
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

      {/* Bookings List */}
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
                {activeTab === 'pending' && 'Pending booking requests will appear here'}
                {activeTab === 'accepted' && 'Accepted bookings will appear here'}
                {activeTab === 'completed' && 'Completed bookings will appear here'}
                {activeTab === 'rejected' && 'Rejected bookings will appear here'}
                {activeTab === 'all' && 'All bookings will appear here'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {currentBookings.map((booking: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const contract = booking.contractDetails as any
            const statusConfig = getStatusConfig(booking.status)
            const StatusIcon = statusConfig.icon
            const companyProfile = booking.company.companyProfile

            return (
              <Link key={booking.id} href={`/freelancer/bookings/${booking.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-2 cursor-pointer hover:border-blue-300">
                  <CardContent className="p-0">
                    <div className="px-4">
                      {/* Header - Company and Amount */}
                      <div className="flex items-start gap-3 mb-2">
                        {/* Company Logo or Initial */}
                        {companyProfile?.logoUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shrink-0">
                            <Image
                              src={companyProfile.logoUrl}
                              alt={companyProfile.companyName || 'Company'}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold shrink-0 text-sm">
                            {(companyProfile?.companyName || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-0.5">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {companyProfile?.companyName || 'Company'}
                            </h3>
                            <Badge className={`shrink-0 ${statusConfig.badgeClass} text-xs px-2 py-0.5`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <Briefcase className="w-3 h-3 shrink-0 text-gray-400" />
                            <span className="truncate">{contract.title || booking.job.title}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="pl-13 space-y-1.5">
                        {/* Amount */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-green-700 text-sm">₹ {contract.budget}</span>
                        </div>
                        
                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(booking.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
