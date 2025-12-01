'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaymentFilters, PaymentFilterState } from './payment-filters'
import { 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Briefcase,
  X,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { confirmPaymentReceived, disputePayment, deletePayment } from '@/lib/actions/freelancer'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

interface FreelancerPaymentsListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payments: any[]
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending Request',
        icon: Clock,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      }
    case 'awaiting_confirmation':
      return {
        label: 'Awaiting Confirmation',
        icon: Clock,
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      }
    case 'paid':
      return {
        label: 'Paid',
        icon: CheckCircle2,
        badgeClass: 'bg-green-100 text-green-800 border-green-300',
      }
    case 'disputed':
      return {
        label: 'Disputed',
        icon: AlertTriangle,
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
      }
    case 'declined':
      return {
        label: 'Declined',
        icon: XCircle,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
      }
    default:
      return {
        label: status,
        icon: AlertTriangle,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
      }
  }
}

export function FreelancerPaymentsList({ payments }: FreelancerPaymentsListProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [filteredPayments, setFilteredPayments] = useState<any[]>(payments)
  const [currentFilters, setCurrentFilters] = useState<PaymentFilterState | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (filters: PaymentFilterState, filtered: any[]) => {
    setCurrentFilters(filters)
    setFilteredPayments(filtered)
  }

  const handleSortChange = (sortBy: PaymentFilterState['sortBy']) => {
    if (currentFilters) {
      const updatedFilters = { ...currentFilters, sortBy }
      setCurrentFilters(updatedFilters)
      let filtered = [...filteredPayments]
      switch (sortBy) {
        case 'amount-high':
          filtered = filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
          break
        case 'amount-low':
          filtered = filtered.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
          break
        case 'oldest':
          filtered = filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        case 'recent':
        default:
          filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
      setFilteredPayments(filtered)
    }
  }

  if (payments.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent>
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <IndianRupee className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Payments Yet
            </h3>
            <p className="text-sm text-gray-600">
              Payment requests and transactions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <PaymentFilters 
        payments={payments}
        onFilterChange={handleFilterChange}
      />

      {/* Results Count and Sort */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm text-gray-600 shrink-0">
          <span className="hidden sm:inline">Showing </span>
          <span className="font-semibold text-gray-900">{filteredPayments.length}</span>
          <span className="hidden sm:inline"> of {payments.length}</span> payments
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Sort By:</span>
          <Select
            value={currentFilters?.sortBy || 'recent'}
            onValueChange={(value) => handleSortChange(value as PaymentFilterState['sortBy'])}
          >
            <SelectTrigger className="w-[140px] sm:w-[200px] h-8 sm:h-9 text-xs sm:text-sm bg-white border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="amount-high">Amount: High to Low</SelectItem>
              <SelectItem value="amount-low">Amount: Low to High</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent>
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <IndianRupee className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No payments match your filters
              </h3>
              <p className="text-sm text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Company</th>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Amount</th>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Status</th>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700 hidden lg:table-cell">Date</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {filteredPayments.map((payment: any) => {
                  const statusConfig = getStatusConfig(payment.status)
                  const StatusIcon = statusConfig.icon
                  const companyProfile = payment.booking.company.companyProfile

                  return (
                    <tr 
                      key={payment.id} 
                      onClick={() => {
                        setSelectedPayment(payment)
                        setIsModalOpen(true)
                      }}
                      className="hover:bg-green-50 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-green-600 group"
                    >
                      {/* Company */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {companyProfile?.logoUrl ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                              <Image
                                src={companyProfile.logoUrl}
                                alt={companyProfile.companyName || 'Company'}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                              {(companyProfile?.companyName || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-gray-900 truncate">{companyProfile?.companyName || 'Company'}</p>
                          </div>
                        </div>
                      </td>

                      
                      {/* Amount */}
                      <td className="p-3">
                        <p className="font-bold text-sm text-gray-900">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
                        {payment.paymentMode && (
                          <p className="text-[10px] text-gray-500">
                            {payment.paymentMode === 'cash' ? 'Cash' : payment.paymentMode === 'upi' ? 'UPI' : 'Bank'}
                          </p>
                        )}
                      </td>

                      
                      {/* Status */}
                      <td className="p-3">
                        <Badge className={`${statusConfig.badgeClass} text-[10px] px-1.5 py-0.5`}>
                          <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                          {statusConfig.label}
                        </Badge>
                      </td>

                      {/* Date - Desktop */}
                      <td className="p-3 hidden lg:table-cell">
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{format(new Date(payment.createdAt), 'MMM d')}</span>
                          </div>
                          {payment.paidAt && (
                            <div className="flex items-center gap-1 text-[10px] text-green-600 mt-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>{format(new Date(payment.paidAt), 'MMM d')}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Chevron */}
                      <td className="p-3">
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Details Modal */}
        {selectedPayment && (
          <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
            <SheetContent 
              side="bottom" 
              className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="relative bg-linear-to-br from-green-600 via-green-500 to-emerald-500 px-6 pt-6 pb-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="pr-12">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                      <IndianRupee className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <SheetTitle className="text-xl font-bold text-white mb-2">
                        Payment Details
                      </SheetTitle>
                      <Badge className={`${getStatusConfig(selectedPayment.status).badgeClass} text-xs px-2 py-1 w-fit mb-2`}>
                        {(() => {
                          const StatusIcon = getStatusConfig(selectedPayment.status).icon
                          return <StatusIcon className="w-3 h-3 mr-1" />
                        })()}
                        {getStatusConfig(selectedPayment.status).label}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-green-50 mt-1">
                        Review and manage this payment request from {selectedPayment.booking.company.companyProfile?.companyName || 'the company'}
                      </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pt-6 pb-6 bg-white overflow-y-auto max-h-[70vh] space-y-4">
                {/* Company Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {selectedPayment.booking.company.companyProfile?.logoUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={selectedPayment.booking.company.companyProfile.logoUrl}
                        alt={selectedPayment.booking.company.companyProfile.companyName || 'Company'}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
                      {(selectedPayment.booking.company.companyProfile?.companyName || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedPayment.booking.company.companyProfile?.companyName || 'Company'}</h3>
                    <Link href={`/freelancer/bookings/${selectedPayment.booking.id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      View Booking
                    </Link>
                  </div>
                </div>

                {/* Amount */}
                <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-1">Payment Amount</p>
                  <p className="text-xl font-bold text-gray-900">₹{parseFloat(selectedPayment.amount).toLocaleString('en-IN')}</p>
                  {selectedPayment.paymentMode && (
                    <p className="text-sm text-green-600 mt-1">
                      via {selectedPayment.paymentMode === 'cash' ? 'Cash' : selectedPayment.paymentMode === 'upi' ? 'UPI' : 'Net Banking'}
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Requested</p>
                    <p className="text-sm font-medium text-gray-900">{format(new Date(selectedPayment.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  {selectedPayment.paidAt && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 mb-1">Paid</p>
                      <p className="text-sm font-medium text-gray-900">{format(new Date(selectedPayment.paidAt), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedPayment.requestNotes && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Request Notes</p>
                    <p className="text-sm text-gray-700">{selectedPayment.requestNotes}</p>
                  </div>
                )}
                {selectedPayment.paymentNotes && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-semibold text-purple-900 mb-2">Payment Notes</p>
                    <p className="text-sm text-gray-700">{selectedPayment.paymentNotes}</p>
                  </div>
                )}
                {selectedPayment.declineReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-900 mb-2">Decline Reason</p>
                    <p className="text-sm text-red-800">{selectedPayment.declineReason}</p>
                  </div>
                )}
                {selectedPayment.disputeReason && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900 mb-2">Dispute Reason</p>
                    <p className="text-sm text-amber-800">{selectedPayment.disputeReason}</p>
                  </div>
                )}

                {/* Actions */}
                {selectedPayment.status === 'pending' && (
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        variant="outline"
                        className="h-12 border-2 border-red-600 text-red-600 hover:bg-red-50 text-sm font-semibold"
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Delete
                      </Button>
                      <Button 
                        onClick={async () => {
                          try {
                            await confirmPaymentReceived(selectedPayment.id)
                            toast.success('Payment marked as paid!')
                            setIsModalOpen(false)
                            window.location.reload()
                          } catch {
                            toast.error('Failed to mark as paid')
                          }
                        }}
                        className="h-12 bg-green-600 hover:bg-green-700 text-sm font-semibold"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Mark as Paid
                      </Button>
                    </div>
                  </div>
                )}
                {selectedPayment.status === 'awaiting_confirmation' && (
                  <div className="pt-4 border-t">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                      <p className="text-sm text-blue-700 font-medium">Company has marked this payment as paid. Please confirm receipt.</p>
                    </div>
                    <Button 
                      onClick={async () => {
                        try {
                          await confirmPaymentReceived(selectedPayment.id)
                          toast.success('Payment confirmed!')
                          setIsModalOpen(false)
                          window.location.reload()
                        } catch {
                          toast.error('Failed to confirm payment')
                        }
                      }}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-sm font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Confirm Payment Received
                    </Button>
                  </div>
                )}
                {selectedPayment.status === 'paid' && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={async () => {
                        const reason = prompt('Please provide a reason for the dispute:')
                        if (!reason) return
                        try {
                          await disputePayment({ paymentId: selectedPayment.id, reason })
                          toast.success('Dispute submitted')
                          setIsModalOpen(false)
                          window.location.reload()
                        } catch {
                          toast.error('Failed to submit dispute')
                        }
                      }}
                      variant="outline"
                      className="w-full h-12 border-2 border-red-600 text-red-600 hover:bg-red-50 text-base font-semibold"
                    >
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Dispute Payment
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Delete Confirmation Modal */}
        {selectedPayment && (
          <Sheet open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
            <SheetContent 
              side="bottom" 
              className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="relative bg-linear-to-br from-red-600 via-red-500 to-rose-500 px-6 pt-6 pb-6">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="pr-12">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 self-center">
                      <SheetTitle className="text-xl font-bold text-white">
                        Delete Request?
                      </SheetTitle>
                    </div>
                  </div>
                  <p className="text-sm text-red-50 mt-3">
                    Are you sure you want to delete this payment request for ₹{parseFloat(selectedPayment.amount).toLocaleString('en-IN')}? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pt-6 pb-6 bg-white space-y-4">
                {/* Company Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  {selectedPayment.booking.company.companyProfile?.logoUrl ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                      <Image
                        src={selectedPayment.booking.company.companyProfile.logoUrl}
                        alt={selectedPayment.booking.company.companyProfile.companyName || 'Company'}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
                      {(selectedPayment.booking.company.companyProfile?.companyName || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{selectedPayment.booking.company.companyProfile?.companyName || 'Company'}</p>
                    <p className="text-xs text-gray-500">Requested on {format(new Date(selectedPayment.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    variant="outline"
                    className="h-12 text-sm font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        await deletePayment(selectedPayment.id)
                        toast.success('Payment request deleted successfully')
                        setIsDeleteConfirmOpen(false)
                        setIsModalOpen(false)
                        window.location.reload()
                      } catch {
                        toast.error('Failed to delete payment request')
                      }
                    }}
                    className="h-12 bg-red-600 hover:bg-red-700 text-sm font-semibold"
                  >
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Delete Request
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
        </>
      )}
    </div>
  )
}
