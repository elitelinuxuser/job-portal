'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { respondToBooking } from '@/lib/actions/freelancer'
import { toast } from 'sonner'
import { XCircle, X, AlertTriangle } from 'lucide-react'

export function RejectBookingSheet({
  bookingId,
}: {
  bookingId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  async function handleReject() {
    setLoading(true)
    try {
      const result = await respondToBooking({
        bookingId,
        accept: false,
        rejectionReason: rejectionReason.trim() || undefined,
      })
      if (result.success) {
        toast.success('Booking request declined')
        setOpen(false)
        window.location.reload()
      } else {
        toast.error('Failed to decline booking')
      }
    } catch (error) {
      toast.error('Failed to decline booking')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="flex-1 h-12 text-base font-semibold bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
      >
        <XCircle className="w-5 h-5 mr-2" />
        Reject
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="bottom" 
          className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-linear-to-br from-red-600 via-red-500 to-rose-500 px-6 pt-6 pb-6">
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
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <SheetTitle className="text-xl font-bold text-white">
                  Reject Booking Request
                </SheetTitle>
              </div>
              
              <SheetDescription className="text-red-50 text-sm">
                Decline this booking request
              </SheetDescription>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6 bg-white">
            {/* Rejection Reason */}
            <div className="mb-6">
              <Label htmlFor="reason" className="text-sm font-semibold text-gray-900 mb-2 block">
                Reason for Rejection (Optional)
              </Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Let the company know why you're declining this request..."
                className="min-h-[100px] text-sm"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                Providing a reason helps maintain good communication with the company.
              </p>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900 mb-1">Permanent Action</p>
                <p className="text-xs text-red-800">
                  Once rejected, you cannot accept this booking request again. The company will be notified of your decision.
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
                onClick={handleReject}
                disabled={loading}
                className="flex-1 h-11 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-sm font-semibold shadow-md"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {loading ? 'Rejecting...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
