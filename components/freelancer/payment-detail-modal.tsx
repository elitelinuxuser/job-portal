'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Briefcase,
  X
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { confirmPaymentReceived, disputePayment, deletePayment } from '@/lib/actions/freelancer'
import { toast } from 'sonner'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
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

interface PaymentDetailModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payment: any | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PaymentDetailModal({ payment, isOpen, onClose, onSuccess }: PaymentDetailModalProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  if (!payment) return null

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      window.location.reload()
    }
  }

  return (
    <>
      {/* Payment Details Modal */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="bottom" 
          className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
        >
          {/* Gradient Header */}
          <div className="relative bg-linear-to-br from-green-600 via-green-500 to-emerald-500 px-6 pt-6 pb-6">
            <button
              onClick={onClose}
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
                  <Badge className={`${getStatusConfig(payment.status).badgeClass} text-xs px-2 py-1 w-fit mb-2`}>
                    {(() => {
                      const StatusIcon = getStatusConfig(payment.status).icon
                      return <StatusIcon className="w-3 h-3 mr-1" />
                    })()}
                    {getStatusConfig(payment.status).label}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-green-50 mt-1">
                Review and manage this payment request{payment.booking?.company?.companyProfile?.companyName ? ` from ${payment.booking.company.companyProfile.companyName}` : ''}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6 bg-white overflow-y-auto max-h-[70vh] space-y-4">
            {/* Company Info */}
            {payment.booking?.company && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {payment.booking.company.companyProfile?.logoUrl ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src={payment.booking.company.companyProfile.logoUrl}
                      alt={payment.booking.company.companyProfile.companyName || 'Company'}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
                    {(payment.booking.company.companyProfile?.companyName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{payment.booking.company.companyProfile?.companyName || 'Company'}</h3>
                  <Link href={`/freelancer/bookings/${payment.booking.id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    View Booking
                  </Link>
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Payment Amount</p>
              <p className="text-xl font-bold text-gray-900">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
              {payment.paymentMode && (
                <p className="text-sm text-green-600 mt-1">
                  via {payment.paymentMode === 'cash' ? 'Cash' : payment.paymentMode === 'upi' ? 'UPI' : 'Net Banking'}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Requested</p>
                <p className="text-sm font-medium text-gray-900">{format(new Date(payment.createdAt), 'MMM d, yyyy')}</p>
              </div>
              {payment.paidAt && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Paid</p>
                  <p className="text-sm font-medium text-gray-900">{format(new Date(payment.paidAt), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {payment.requestNotes && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">Request Notes</p>
                <p className="text-sm text-gray-700">{payment.requestNotes}</p>
              </div>
            )}
            {payment.paymentNotes && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-semibold text-purple-900 mb-2">Payment Notes</p>
                <p className="text-sm text-gray-700">{payment.paymentNotes}</p>
              </div>
            )}
            {payment.declineReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-900 mb-2">Decline Reason</p>
                <p className="text-sm text-red-800">{payment.declineReason}</p>
              </div>
            )}
            {payment.disputeReason && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 mb-2">Dispute Reason</p>
                <p className="text-sm text-amber-800">{payment.disputeReason}</p>
              </div>
            )}

            {/* Actions */}
            {payment.status === 'pending' && (
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
                        await confirmPaymentReceived(payment.id)
                        toast.success('Payment marked as paid!')
                        onClose()
                        handleSuccess()
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
            {payment.status === 'awaiting_confirmation' && (
              <div className="pt-4 border-t">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-700 font-medium">Company has marked this payment as paid. Please confirm receipt.</p>
                </div>
                <Button 
                  onClick={async () => {
                    try {
                      await confirmPaymentReceived(payment.id)
                      toast.success('Payment confirmed!')
                      onClose()
                      handleSuccess()
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
            {payment.status === 'paid' && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={async () => {
                    const reason = prompt('Please provide a reason for the dispute:')
                    if (!reason) return
                    try {
                      await disputePayment({ paymentId: payment.id, reason })
                      toast.success('Dispute submitted')
                      onClose()
                      handleSuccess()
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

      {/* Delete Confirmation Modal */}
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
                Are you sure you want to delete this payment request for ₹{parseFloat(payment.amount).toLocaleString('en-IN')}? This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6 bg-white space-y-4">
            {/* Company Info */}
            {payment.booking?.company && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                {payment.booking.company.companyProfile?.logoUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                    <Image
                      src={payment.booking.company.companyProfile.logoUrl}
                      alt={payment.booking.company.companyProfile.companyName || 'Company'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
                    {(payment.booking.company.companyProfile?.companyName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-gray-900">{payment.booking.company.companyProfile?.companyName || 'Company'}</p>
                  <p className="text-xs text-gray-500">Requested on {format(new Date(payment.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}

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
                    await deletePayment(payment.id)
                    toast.success('Payment request deleted successfully')
                    setIsDeleteConfirmOpen(false)
                    onClose()
                    handleSuccess()
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
    </>
  )
}
