'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { requestPayment } from '@/lib/actions/freelancer'
import { toast } from 'sonner'
import { IndianRupee, X, AlertCircle, Send } from 'lucide-react'

export function RequestPaymentSheet({
  bookingId,
  budget,
  companyName,
  existingPayments = [],
}: {
  bookingId: string
  budget: number
  companyName: string
  existingPayments?: Array<{
    status: string
    amount: string
  }>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Calculate total paid (paid payments only)
  const totalPaid = existingPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
  
  // Calculate balance due
  const balanceDue = budget - totalPaid
  
  const [amount, setAmount] = useState(balanceDue > 0 ? balanceDue.toString() : '')
  const [notes, setNotes] = useState('')

  // Reset form when modal is closed
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset form when closing
      setAmount(balanceDue > 0 ? balanceDue.toString() : '')
      setNotes('')
    }
  }

  async function handleRequestPayment() {
    const paymentAmount = parseFloat(amount)
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (paymentAmount > balanceDue) {
      toast.error(`Amount cannot exceed balance due (₹${balanceDue.toLocaleString('en-IN')})`)
      return
    }

    setLoading(true)
    try {
      const result = await requestPayment({
        bookingId,
        amount: paymentAmount,
        notes: notes.trim() || undefined,
      })
      if (result.success) {
        toast.success('Payment request sent successfully!')
        setOpen(false)
        setNotes('')
        // Scroll to payment history section after reload
        const currentUrl = window.location.pathname
        window.location.href = currentUrl + '#payment-history'
      } else {
        toast.error('Failed to request payment')
      }
    } catch (error) {
      toast.error('Failed to request payment')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        disabled={balanceDue <= 0}
        className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <IndianRupee className="w-5 h-5 mr-2" />
        {balanceDue <= 0 ? 'Payment Complete' : 'Request Payment'}
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-linear-to-br from-green-600 via-green-500 to-emerald-500 px-6 pt-6 pb-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="pr-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <SheetTitle className="text-xl font-bold text-white">
                  Request Payment
                </SheetTitle>
              </div>
              
              <SheetDescription className="text-green-50 text-sm">
                Request payment from {companyName}
              </SheetDescription>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6 bg-white">
            {/* Budget Breakdown - Compact */}
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Booking Budget</span>
                  <span className="font-semibold text-gray-900">₹{budget.toLocaleString('en-IN')}</span>
                </div>
                {totalPaid > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-semibold text-green-700">-₹{totalPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-gray-300 my-1"></div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-700">Balance Due</span>
                  <span className="text-lg font-bold text-gray-900">₹{balanceDue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <Label htmlFor="payment-amount" className="text-sm font-semibold text-gray-900 mb-2 block">
                Payment Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₹
                </div>
                <Input
                  id="payment-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-8 text-base font-medium"
                  min="0"
                  max={balanceDue}
                  step="0.01"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {balanceDue > 0 ? 'You can request partial payment or full balance' : 'Full payment has been received'}
              </p>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <Label htmlFor="payment-notes" className="text-sm font-semibold text-gray-900 mb-2 block">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="payment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the payment request (e.g., work completed, deliverables provided)..."
                className="min-h-[100px] text-sm"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be sent to the company along with your payment request.
              </p>
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Note</p>
                <p className="text-xs text-blue-800">
                  The company will be notified of your payment request. They can process the payment through the platform.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 h-11 text-sm font-semibold border-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRequestPayment}
                disabled={loading}
                className="flex-1 h-11 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm font-semibold shadow-md"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
