'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import { 
  IndianRupee, 
  CheckCircle2, 
  XCircle,
  User,
  X
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { markPaymentAsPaid, declinePayment } from '@/lib/actions/company'
import { toast } from 'sonner'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending Request',
        icon: IndianRupee,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      }
    case 'awaiting_confirmation':
      return {
        label: 'Awaiting Confirmation',
        icon: CheckCircle2,
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
        icon: IndianRupee,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
      }
  }
}

interface CompanyPaymentDetailModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payment: any | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CompanyPaymentDetailModal({ payment, isOpen, onClose, onSuccess }: CompanyPaymentDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!payment) return null

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    } else {
      window.location.reload()
    }
  }

  const handleMarkAsPaid = async () => {
    const paymentMode = prompt('Enter payment mode (cash/upi/bank):')
    if (!paymentMode) return
    
    const notes = prompt('Add payment notes (optional):')
    
    setIsProcessing(true)
    try {
      await markPaymentAsPaid({
        paymentId: payment.id,
        paymentMode: paymentMode.toLowerCase(),
        paymentNotes: notes || undefined,
      })
      toast.success('Payment marked as paid! Awaiting freelancer confirmation.')
      onClose()
      handleSuccess()
    } catch (error) {
      toast.error('Failed to mark payment as paid')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    const reason = prompt('Please provide a reason for declining:')
    if (!reason) return
    
    setIsProcessing(true)
    try {
      await declinePayment({
        paymentId: payment.id,
        reason,
      })
      toast.success('Payment request declined')
      onClose()
      handleSuccess()
    } catch (error) {
      toast.error('Failed to decline payment')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
      >
        {/* Gradient Header */}
        <div className="relative bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 pt-6 pb-6">
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
                  Payment Request
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
            <p className="text-sm text-blue-50 mt-1">
              Review and manage this payment request from {payment.booking?.freelancer?.freelancerProfile?.name || 'freelancer'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-6 bg-white overflow-y-auto max-h-[70vh] space-y-4">
          {/* Freelancer Info */}
          {payment.booking?.freelancer && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {payment.booking.freelancer.freelancerProfile?.profilePhoto ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={payment.booking.freelancer.freelancerProfile.profilePhoto}
                    alt={payment.booking.freelancer.freelancerProfile.name || 'Freelancer'}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-semibold">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{payment.booking.freelancer.freelancerProfile?.name || 'Freelancer'}</h3>
                <p className="text-sm text-gray-500">Payment request from freelancer</p>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="p-4 bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Payment Amount</p>
            <p className="text-xl font-bold text-gray-900">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
            {payment.paymentMode && (
              <p className="text-sm text-blue-600 mt-1">
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
            {payment.awaitingConfirmationAt && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Marked as Paid</p>
                <p className="text-sm font-medium text-gray-900">{format(new Date(payment.awaitingConfirmationAt), 'MMM d, yyyy')}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {payment.requestNotes && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-900 mb-2">Request Notes</p>
              <p className="text-sm text-gray-700">{payment.requestNotes}</p>
            </div>
          )}
          {payment.paymentNotes && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">Payment Notes</p>
              <p className="text-sm text-gray-700">{payment.paymentNotes}</p>
            </div>
          )}
          {payment.declineReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-900 mb-2">Decline Reason</p>
              <p className="text-sm text-red-800">{payment.declineReason}</p>
            </div>
          )}

          {/* Actions */}
          {payment.status === 'pending' && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleDecline}
                  disabled={isProcessing}
                  variant="outline"
                  className="h-12 border-2 border-red-600 text-red-600 hover:bg-red-50 text-sm font-semibold"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Decline
                </Button>
                <Button 
                  onClick={handleMarkAsPaid}
                  disabled={isProcessing}
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  Payment marked as paid. Awaiting freelancer confirmation.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
