'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { CompanyPaymentDetailModal } from './company-payment-detail-modal'

interface CompanyBookingPaymentHistoryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payments: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  booking?: any
}

const getPaymentStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending Request',
        bgClass: 'bg-amber-50',
        borderClass: 'border-amber-200',
        textClass: 'text-amber-900',
        badgeClass: 'bg-amber-600 text-white',
      }
    case 'awaiting_confirmation':
      return {
        label: 'Awaiting Confirmation',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-200',
        textClass: 'text-blue-900',
        badgeClass: 'bg-blue-600 text-white',
      }
    case 'paid':
      return {
        label: 'Paid',
        bgClass: 'bg-green-50',
        borderClass: 'border-green-200',
        textClass: 'text-green-900',
        badgeClass: 'bg-green-600 text-white',
      }
    case 'declined':
      return {
        label: 'Declined',
        bgClass: 'bg-gray-50',
        borderClass: 'border-gray-200',
        textClass: 'text-gray-900',
        badgeClass: 'bg-gray-600 text-white',
      }
    default:
      return {
        label: status,
        bgClass: 'bg-gray-50',
        borderClass: 'border-gray-200',
        textClass: 'text-gray-900',
        badgeClass: 'bg-gray-600 text-white',
      }
  }
}

export function CompanyBookingPaymentHistory({ payments, booking }: CompanyBookingPaymentHistoryProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="space-y-3">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payments.map((payment: any) => {
          const statusConfig = getPaymentStatusConfig(payment.status)

          return (
            <div 
              key={payment.id} 
              onClick={() => {
                // Merge booking context into payment if provided
                const paymentWithBooking = booking ? { ...payment, booking } : payment
                setSelectedPayment(paymentWithBooking)
                setIsModalOpen(true)
              }}
              className={`p-4 ${statusConfig.bgClass} rounded-lg border ${statusConfig.borderClass} cursor-pointer hover:shadow-md transition-all`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className={`text-xl font-bold ${statusConfig.textClass}`}>₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
                  {payment.status === 'pending' && (
                    <p className="text-xs text-gray-600 mt-1">
                      Requested on {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </p>
                  )}
                  {payment.status === 'awaiting_confirmation' && payment.awaitingConfirmationAt && (
                    <p className="text-xs text-blue-600 mt-1">
                      Awaiting confirmation since {format(new Date(payment.awaitingConfirmationAt), 'MMM d, yyyy')}
                    </p>
                  )}
                  {payment.status === 'paid' && payment.paidAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Paid on {format(new Date(payment.paidAt), 'MMM d, yyyy')}
                    </p>
                  )}
                  {payment.status === 'declined' && payment.updatedAt && (
                    <p className="text-xs text-gray-600 mt-1">
                      Declined on {format(new Date(payment.updatedAt), 'MMM d, yyyy')}
                    </p>
                  )}
                  {payment.paymentMode && (
                    <p className="text-xs text-gray-600 mt-1">
                      via {payment.paymentMode === 'cash' ? 'Cash' : payment.paymentMode === 'upi' ? 'UPI' : 'Net Banking'}
                    </p>
                  )}
                </div>
                <Badge className={statusConfig.badgeClass}>{statusConfig.label}</Badge>
              </div>
              {payment.requestNotes && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
                  <p className="font-medium text-amber-900">Request Notes:</p>
                  <p className="text-gray-700 mt-0.5">{payment.requestNotes}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Payment Details Modal */}
      <CompanyPaymentDetailModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
