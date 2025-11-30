'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { createBookingRequest } from '@/lib/actions/jobs'
import { toast } from 'sonner'
import { Calendar, Send, X, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { BookingRequest } from '@/types/job-responses'

export function SendBookingRequest({
  jobId,
  freelancerId,
  freelancerName,
  className,
  bookingRequest,
}: {
  jobId: string
  freelancerId: string
  freelancerName: string
  className?: string
  bookingRequest?: BookingRequest | null
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    setLoading(true)
    try {
      const result = await createBookingRequest({ jobId, freelancerId })
      if (result.success) {
        toast.success('Booking request sent successfully!')
        setOpen(false)
        // Refresh the page to show updated status
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to send booking request')
      }
    } catch (error) {
      toast.error('Failed to send booking request')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // If booking request exists, show status instead
  if (bookingRequest) {
    const statusConfig = {
      pending: {
        label: 'Booking Pending',
        icon: Clock,
        className: 'bg-amber-600 hover:bg-amber-700',
        badgeClassName: 'bg-amber-100 text-amber-800 border-amber-300'
      },
      accepted: {
        label: 'Booking Accepted',
        icon: CheckCircle2,
        className: 'bg-green-600 hover:bg-green-700',
        badgeClassName: 'bg-green-100 text-green-800 border-green-300'
      },
      rejected: {
        label: 'Booking Rejected',
        icon: XCircle,
        className: 'bg-red-600 hover:bg-red-700',
        badgeClassName: 'bg-red-100 text-red-800 border-red-300'
      }
    }

    const config = statusConfig[bookingRequest.status]
    const Icon = config.icon

    return (
      <Button disabled className={className}>
        <Icon className="w-4 h-4 mr-2" />
        {config.label}
      </Button>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className={className}>
        <Calendar className="w-4 h-4 mr-2" />
        Send Booking Request
      </Button>

      {/* Confirmation Bottom Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="bottom" 
          className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-linear-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 pt-6 pb-6">
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
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <SheetTitle className="text-xl font-bold text-white">
                  Confirm Booking
                </SheetTitle>
              </div>
              
              <SheetDescription className="text-blue-50 text-sm">
                Send booking request to {freelancerName}
              </SheetDescription>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pt-6 pb-6 bg-white">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Ready to proceed?</p>
                <p className="text-xs text-blue-800">
                  {freelancerName} will be notified about your booking request. They can accept or decline based on their availability.
                </p>
              </div>
            </div>

            {/* CTAs */}
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
                onClick={handleSend} 
                disabled={loading}
                className="flex-1 h-11 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-sm font-semibold shadow-md"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending...' : 'Confirm & Send'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}



