'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { respondToBooking } from '@/lib/actions/freelancer'
import { toast } from 'sonner'
import { CheckCircle2, X, IndianRupee, AlertCircle, Shield } from 'lucide-react'
import { getSelectedContractTerms } from '@/lib/constants/contract-terms'

export function AcceptBookingSheet({
  bookingId,
  budget,
  companyName,
  contract,
}: {
  bookingId: string
  budget: number
  companyName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contract: any
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    try {
      const result = await respondToBooking({
        bookingId,
        accept: true,
      })
      if (result.success) {
        toast.success('Booking accepted successfully!')
        setOpen(false)
        window.location.reload()
      } else {
        toast.error('Failed to accept booking')
      }
    } catch (error) {
      toast.error('Failed to accept booking')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 text-base font-semibold"
      >
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Accept
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
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
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <SheetTitle className="text-xl font-bold text-white">
                  Accept Booking Request
                </SheetTitle>
              </div>
              
              <SheetDescription className="text-green-50 text-sm">
                Confirm your acceptance for this booking
              </SheetDescription>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6 bg-white">
            {/* Budget Display */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Booking Amount</p>
                  <p className="font-bold text-gray-900">{budget.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <p className="text-xs text-green-800">
                You will receive this amount from {companyName} upon completing the work as per the contract terms.
              </p>
            </div>

            {/* Contract Terms */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Contract Terms</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {getSelectedContractTerms(contract.contractTerms as string[] | null).map((term) => (
                  <div key={term.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-xs font-medium text-gray-900">{term.label}</span>
                  </div>
                ))}
              </div>
              {contract.contractAdditionalDetails && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-1">Additional Details</p>
                  <p className="text-xs text-gray-700">{contract.contractAdditionalDetails}</p>
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">Important</p>
                <p className="text-xs text-amber-800">
                  By accepting, you commit to complete this booking as per the agreed contract terms. 
                  The company will contact you via WhatsApp to coordinate further details.
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
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 h-11 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm font-semibold shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {loading ? 'Accepting...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
