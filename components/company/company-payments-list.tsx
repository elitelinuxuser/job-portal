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
import { CompanyPaymentFilters, CompanyPaymentFilterState } from './company-payment-filters'
import { CompanyPaymentDetailModal } from './company-payment-detail-modal'
import { 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  X,
  Clock,
  User
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import Image from 'next/image'

interface CompanyPaymentsListProps {
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

export function CompanyPaymentsList({ payments }: CompanyPaymentsListProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [filteredPayments, setFilteredPayments] = useState<any[]>(payments)
  const [currentFilters, setCurrentFilters] = useState<CompanyPaymentFilterState | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedBookingTransactions, setSelectedBookingTransactions] = useState<any[]>([])
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false)

  // Group payments by booking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobGroups = filteredPayments.reduce((acc: any[], payment: any) => {
    const bookingId = payment.booking.id
    let group = acc.find(g => g.booking.id === bookingId)
    
    if (!group) {
      group = {
        booking: payment.booking,
        transactions: [],
        totalAmount: payment.booking.contractDetails?.budget || 0,
        paidAmount: 0,
      }
      acc.push(group)
    }
    
    group.transactions.push(payment)
    
    if (payment.status === 'paid') {
      group.paidAmount += parseFloat(payment.amount)
    }
    
    return acc
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (filters: CompanyPaymentFilterState, filtered: any[]) => {
    setFilteredPayments(filtered)
    setCurrentFilters(filters)
  }

  const handleSortChange = (sortBy: CompanyPaymentFilterState['sortBy']) => {
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
              No Payment Transactions Yet
            </h3>
            <p className="text-sm text-gray-600">
              Payment transactions grouped by booking will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <CompanyPaymentFilters 
        payments={payments}
        onFilterChange={handleFilterChange}
      />

      {/* Results Count and Sort */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm text-gray-600 shrink-0">
          <span className="hidden sm:inline">Showing </span>
          <span className="font-semibold text-gray-900">{jobGroups.length}</span>
          <span className="hidden sm:inline"> booking{jobGroups.length !== 1 ? 's' : ''} with</span>
          <span className="sm:hidden"> / </span>
          <span className="font-semibold text-gray-900">{filteredPayments.length}</span> payment{filteredPayments.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Sort By:</span>
          <Select
            value={currentFilters?.sortBy || 'recent'}
            onValueChange={(value) => handleSortChange(value as CompanyPaymentFilterState['sortBy'])}
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

      {/* Job Groups List */}
      {jobGroups.length === 0 ? (
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
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Job Title</th>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Freelancer</th>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Total Amount</th>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Amount Paid</th>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Balance Due</th>
                  <th className="text-left p-3 font-semibold text-xs text-gray-700">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {jobGroups.map((group: any) => {
                  const freelancerProfile = group.booking.freelancer.freelancerProfile

                  return (
                    <tr 
                      key={group.booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Job Title */}
                      <td className="p-3">
                        <Link 
                          href={`/company/bookings/${group.booking.id}`}
                          className="font-semibold text-sm text-blue-600 hover:underline block truncate max-w-[200px]"
                          title={group.booking.job?.title || 'Job'}
                        >
                          {group.booking.job?.title || 'Job'}
                        </Link>
                      </td>

                      {/* Freelancer */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {freelancerProfile?.profilePhoto ? (
                            <Image
                              src={freelancerProfile.profilePhoto}
                              alt={freelancerProfile.name}
                              width={24}
                              height={24}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                          )}
                          <p className="font-medium text-sm text-gray-900">{freelancerProfile?.name || 'Unknown'}</p>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="p-3">
                        <p className="font-bold text-sm text-gray-900">₹{parseFloat(group.totalAmount || 0).toLocaleString('en-IN')}</p>
                      </td>

                      {/* Amount Paid */}
                      <td className="p-3">
                        <p className="font-semibold text-sm text-green-600">₹{group.paidAmount.toLocaleString('en-IN')}</p>
                      </td>

                      {/* Balance Due */}
                      <td className="p-3">
                        <p className={`font-semibold text-sm ${parseFloat(group.totalAmount || 0) - group.paidAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                          ₹{(parseFloat(group.totalAmount || 0) - group.paidAmount).toLocaleString('en-IN')}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="p-3">
                        <Button
                          onClick={() => {
                            setSelectedBookingTransactions(group.transactions)
                            setIsTransactionsModalOpen(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs w-full"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Details Modal */}
        <CompanyPaymentDetailModal
          payment={selectedPayment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Transactions List Modal */}
        <Sheet open={isTransactionsModalOpen} onOpenChange={setIsTransactionsModalOpen}>
          <SheetContent 
            side="bottom" 
            className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
          >
            {/* Gradient Header */}
            <div className="relative bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 pt-6 pb-6">
              <button
                onClick={() => setIsTransactionsModalOpen(false)}
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
                      Payment Transactions
                    </SheetTitle>
                    <p className="text-sm text-blue-50">
                      {selectedBookingTransactions.length} transaction{selectedBookingTransactions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-6 pb-6 bg-white overflow-y-auto max-h-[60vh] space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {selectedBookingTransactions.map((payment: any) => {
                const statusConfig = getStatusConfig(payment.status)
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={payment.id}
                    onClick={() => {
                      setSelectedPayment(payment)
                      setIsModalOpen(true)
                    }}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-gray-600" />
                        <p className="text-lg font-bold text-gray-900">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
                      </div>
                      <Badge className={statusConfig.badgeClass}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <p>Requested: {format(new Date(payment.createdAt), 'MMM d, yyyy')}</p>
                      {payment.paidAt && (
                        <p className="text-green-600">Paid: {format(new Date(payment.paidAt), 'MMM d, yyyy')}</p>
                      )}
                      {payment.awaitingConfirmationAt && (
                        <p className="text-blue-600">Marked as paid: {format(new Date(payment.awaitingConfirmationAt), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
        </>
      )}
    </div>
  )
}
