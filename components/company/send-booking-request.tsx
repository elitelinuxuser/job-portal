'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { createBookingRequest, updateBookingRequest } from '@/lib/actions/jobs'
import { toast } from 'sonner'
import { Calendar, Send, X, CheckCircle2, Clock, IndianRupee, Edit2, Eye, RotateCcw, AlertCircle } from 'lucide-react'
import type { BookingRequest } from '@/types/job-responses'
import Link from 'next/link'

export function SendBookingRequest({
  jobId,
  freelancerId,
  freelancerName,
  className,
  bookingRequest,
  jobBudget,
  proposedPrice,
}: {
  jobId: string
  freelancerId: string
  freelancerName: string
  className?: string
  bookingRequest?: BookingRequest | null
  jobBudget: number
  proposedPrice?: number
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Use proposedPrice if available, otherwise use jobBudget
  const defaultBudget = bookingRequest?.contractDetails?.budget ?? proposedPrice ?? jobBudget
  const [customBudget, setCustomBudget] = useState<string>(defaultBudget.toString())

  async function handleSend() {
    const budgetValue = parseFloat(customBudget)
    
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast.error('Please enter a valid budget amount')
      return
    }

    setLoading(true)
    try {
      const result = await createBookingRequest({ 
        jobId, 
        freelancerId,
        customBudget: budgetValue,
        proposedPrice: proposedPrice
      })
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

  // If booking request exists, show appropriate action based on status
  if (bookingRequest) {
    // PENDING STATE: Edit Booking Request
    if (bookingRequest.status === 'pending') {
      return (
        <>
          <Button onClick={() => setOpen(true)} className={className}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Booking Request
          </Button>

          {/* Edit Booking Sheet */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent 
              side="bottom" 
              className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-linear-to-br from-amber-600 via-amber-500 to-orange-500 px-6 pt-6 pb-6">
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
                      <Edit2 className="w-5 h-5 text-white" />
                    </div>
                    <SheetTitle className="text-xl font-bold text-white">
                      Edit Booking Request
                    </SheetTitle>
                  </div>
                  
                  <SheetDescription className="text-amber-50 text-sm">
                    Update budget for {freelancerName}
                  </SheetDescription>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pt-6 pb-6 bg-white">
                <div className="mb-6">
                  <Label htmlFor="budget" className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-gray-600" />
                    Budget Amount
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 font-medium">₹</span>
                    </div>
                    <Input
                      id="budget"
                      type="number"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      placeholder="Enter budget amount"
                      className="pl-8 h-11 text-base font-semibold border-2 focus:border-amber-500"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">Pending Approval</p>
                    <p className="text-xs text-amber-800">
                      {freelancerName} is reviewing your booking request. Update the budget if needed.
                    </p>
                  </div>
                </div>

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
                    onClick={async () => {
                      const budgetValue = parseFloat(customBudget)
                      if (isNaN(budgetValue) || budgetValue <= 0) {
                        toast.error('Please enter a valid budget amount')
                        return
                      }
                      setLoading(true)
                      try {
                        const result = await updateBookingRequest({ 
                          bookingId: bookingRequest.id,
                          customBudget: budgetValue
                        })
                        if (result.success) {
                          toast.success('Booking request updated successfully!')
                          setOpen(false)
                          window.location.reload()
                        } else {
                          toast.error(result.error || 'Failed to update booking request')
                        }
                      } catch (error) {
                        toast.error('Failed to update booking request')
                        console.error(error)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="flex-1 h-11 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm font-semibold shadow-md"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Request'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )
    }

    // ACCEPTED STATE: View Booking Details
    if (bookingRequest.status === 'accepted') {
      return (
        <Link href={`/company/bookings/${bookingRequest.id}`} className={className}>
          <Button className="w-full bg-green-600 hover:bg-green-700">
            <Eye className="w-4 h-4 mr-2" />
            View Booking Details
          </Button>
        </Link>
      )
    }

    // REJECTED STATE: Send Revised Request
    if (bookingRequest.status === 'rejected') {
      return (
        <>
          {/* Show rejection reason if exists */}
          {bookingRequest.rejectionReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</p>
                  <p className="text-xs text-red-800">{bookingRequest.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
          
          <Button onClick={() => setOpen(true)} className={className}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Send Revised Request
          </Button>

          {/* Revised Request Sheet - Same as new request */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent 
              side="bottom" 
              className="h-auto px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
            >
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
                      <RotateCcw className="w-5 h-5 text-white" />
                    </div>
                    <SheetTitle className="text-xl font-bold text-white">
                      Send Revised Request
                    </SheetTitle>
                  </div>
                  
                  <SheetDescription className="text-blue-50 text-sm">
                    Submit an updated booking request to {freelancerName}
                  </SheetDescription>
                </div>
              </div>

              <div className="px-6 pt-6 pb-6 bg-white">
                <div className="mb-6">
                  <Label htmlFor="budget" className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-gray-600" />
                    Budget Amount
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 font-medium">₹</span>
                    </div>
                    <Input
                      id="budget"
                      type="number"
                      value={customBudget}
                      onChange={(e) => setCustomBudget(e.target.value)}
                      placeholder="Enter budget amount"
                      className="pl-8 h-11 text-base font-semibold border-2 focus:border-blue-500"
                      min="0"
                      step="100"
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {proposedPrice && proposedPrice !== jobBudget && (
                      <p className="text-xs text-green-700 font-medium">
                        💰 Freelancer proposed: ₹{proposedPrice.toLocaleString('en-IN')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Job budget: ₹{jobBudget.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

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
                    {loading ? 'Sending...' : 'Send Revised Request'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </>
      )
    }
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
            {/* Budget Input */}
            <div className="mb-6">
              <Label htmlFor="budget" className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-600" />
                Budget Amount
              </Label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500 font-medium">₹</span>
                </div>
                <Input
                  id="budget"
                  type="number"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                  placeholder="Enter budget amount"
                  className="pl-8 h-11 text-base font-semibold border-2 focus:border-blue-500"
                  min="0"
                  step="100"
                />
              </div>
              <div className="mt-2 space-y-1">
                {proposedPrice && proposedPrice !== jobBudget && (
                  <p className="text-xs text-green-700 font-medium">
                    💰 Freelancer proposed: ₹{proposedPrice.toLocaleString('en-IN')}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Job budget: ₹{jobBudget.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Ready to proceed?</p>
                <p className="text-xs text-blue-800">
                  {freelancerName} will be notified about your booking request with the budget amount of ₹{parseFloat(customBudget || '0').toLocaleString('en-IN')}.
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



