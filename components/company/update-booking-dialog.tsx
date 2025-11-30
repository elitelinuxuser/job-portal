'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { updateBookingRequest } from '@/lib/actions/jobs'
import { toast } from 'sonner'
import { IndianRupee, Edit2, X, Send, Clock } from 'lucide-react'

export function UpdateBookingDialog({
  bookingId,
  currentBudget,
  freelancerName,
}: {
  bookingId: string
  currentBudget: number
  freelancerName: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customBudget, setCustomBudget] = useState<string>(currentBudget.toString())

  async function handleUpdate() {
    const budgetValue = parseFloat(customBudget)
    
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast.error('Please enter a valid budget amount')
      return
    }

    setLoading(true)
    try {
      const result = await updateBookingRequest({ 
        bookingId,
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
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 h-12 text-base font-semibold">
        <Edit2 className="w-5 h-5 mr-2" />
        Update Booking Request
      </Button>

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
                  Update Booking Request
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
                onClick={handleUpdate}
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
