'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IndianRupee, CheckCircle2, Clock, Plus, ArrowRight, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { markPaymentAsPaid, createCompanyPayment } from '@/lib/actions/company'

interface MakePaymentButtonProps {
  bookingId: string
  totalAmount: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payments: any[]
}

interface PaymentSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payments: any[]
  bookingId: string
}

function PaymentSelectionModal({ isOpen, onClose, totalAmount, payments, bookingId }: PaymentSelectionModalProps) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false)
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('')

  // Calculate totals
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
  
  const balanceDue = totalAmount - totalPaid

  const pendingPayments = payments.filter(p => p.status === 'pending')

  const handleContinue = () => {
    if (!selectedPaymentId) {
      toast.error('Please select a payment option')
      return
    }

    if (selectedPaymentId === 'new') {
      setShowNewPaymentModal(true)
    } else {
      setShowPaymentModeModal(true)
    }
  }

  const handleMarkAsPaid = async (paymentMode: string, notes: string) => {
    if (!selectedPaymentId || selectedPaymentId === 'new') return
    
    setIsProcessing(true)
    try {
      await markPaymentAsPaid({
        paymentId: selectedPaymentId,
        paymentMode,
        paymentNotes: notes || undefined,
      })
      
      toast.success('Payment marked as paid!')
      setShowPaymentModeModal(false)
      setSelectedPaymentMode('')
      onClose()
      window.location.reload()
    } catch (error) {
      toast.error('Failed to mark payment as paid')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreatePayment = async (amount: string, notes: string) => {
    setIsProcessing(true)
    try {
      await createCompanyPayment({
        bookingId,
        amount,
        paymentNotes: notes || undefined,
      })
      
      toast.success('Payment initiated successfully!')
      setShowNewPaymentModal(false)
      onClose()
      window.location.reload()
    } catch (error) {
      toast.error('Failed to create payment')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Main Selection Modal */}
      <Sheet open={isOpen && !showPaymentModeModal && !showNewPaymentModal} onOpenChange={onClose}>
        <SheetContent 
          side="bottom" 
          className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden max-h-[90vh]"
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
                    Make Payment
                  </SheetTitle>
                  <p className="text-sm text-blue-50">
                    Select payment requests or create a new payment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6 bg-white overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            {/* Payment Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 mb-1">Paid</p>
                <p className="text-lg font-bold text-gray-900">₹{totalPaid.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-600 mb-1">Balance</p>
                <p className="text-lg font-bold text-gray-900">₹{balanceDue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Pending Payment Requests */}
              {pendingPayments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Pending Payment Requests</h3>
                  <div className="space-y-2">
                    {pendingPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedPaymentId === payment.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPaymentId(payment.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                            ${
                              selectedPaymentId === payment.id
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-gray-300 bg-white'
                            }
                          ">
                            {selectedPaymentId === payment.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">₹{parseFloat(payment.amount).toLocaleString('en-IN')}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Requested on {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            {payment.requestNotes && (
                              <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded border border-gray-200">
                                {payment.requestNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Payment Option */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Or Create New Payment</h3>
                <div
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedPaymentId === 'new'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPaymentId('new')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${
                        selectedPaymentId === 'new'
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300 bg-white'
                      }
                    ">
                      {selectedPaymentId === 'new' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Create New Payment</p>
                        <p className="text-xs text-gray-500">Initiate a new payment transaction</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={handleContinue}
                disabled={!selectedPaymentId}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Mode Modal */}
      <Sheet open={showPaymentModeModal} onOpenChange={(open) => {
        setShowPaymentModeModal(open)
        if (!open) setSelectedPaymentMode('')
      }}>
        <SheetContent 
          side="bottom" 
          className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
        >
          <div className="relative bg-linear-to-br from-green-600 via-green-500 to-emerald-500 px-6 pt-6 pb-6">
            <button
              onClick={() => {
                setShowPaymentModeModal(false)
                setSelectedPaymentMode('')
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="pr-12">
              <SheetTitle className="text-xl font-bold text-white mb-2">
                Payment Details
              </SheetTitle>
              <p className="text-sm text-green-50">
                Enter payment mode and optional notes
              </p>
            </div>
          </div>

          <div className="px-6 pt-6 pb-6 bg-white space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!selectedPaymentMode) {
                  toast.error('Please select a payment mode')
                  return
                }
                const formData = new FormData(e.currentTarget)
                const notes = formData.get('notes') as string
                handleMarkAsPaid(selectedPaymentMode, notes)
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <Select value={selectedPaymentMode} onValueChange={setSelectedPaymentMode}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="net_banking">Net Banking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Add any additional notes about this payment..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    The selected payment request will be marked as paid
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowPaymentModeModal(false)
                    setSelectedPaymentMode('')
                  }}
                  variant="outline"
                  className="h-12"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-12 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing || !selectedPaymentMode}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* New Payment Modal */}
      <Sheet open={showNewPaymentModal} onOpenChange={setShowNewPaymentModal}>
        <SheetContent 
          side="bottom" 
          className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
        >
          <div className="relative bg-linear-to-br from-green-600 via-green-500 to-emerald-500 px-6 pt-6 pb-6">
            <button
              onClick={() => setShowNewPaymentModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="pr-12">
              <SheetTitle className="text-xl font-bold text-white mb-2">
                Create New Payment
              </SheetTitle>
              <p className="text-sm text-green-50">
                Enter payment amount and optional notes
              </p>
            </div>
          </div>

          <div className="px-6 pt-6 pb-6 bg-white space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const amount = formData.get('amount') as string
                const notes = formData.get('notes') as string
                handleCreatePayment(amount, notes)
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="amount"
                      required
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Add any notes about this payment..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    This payment will be sent to the freelancer for confirmation
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  onClick={() => setShowNewPaymentModal(false)}
                  variant="outline"
                  className="h-12"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-12 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Creating...' : 'Create Payment'}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function MakePaymentButton({ bookingId, totalAmount, payments }: MakePaymentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
  
  const balanceDue = totalAmount - totalPaid

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
      >
        <IndianRupee className="w-5 h-5 mr-2" />
        Make Payment
        {balanceDue > 0 && (
          <Badge className="ml-2 bg-white/20 text-white border-white/30">
            ₹{balanceDue.toLocaleString('en-IN')} due
          </Badge>
        )}
      </Button>

      <PaymentSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalAmount={totalAmount}
        payments={payments}
        bookingId={bookingId}
      />
    </>
  )
}
