'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle } from 'lucide-react'
import { markBookingAsPaid } from '@/lib/actions/jobs'
import { toast } from 'sonner'

export function MarkAsPaidDialog({ bookingId, budget }: { bookingId: string; budget: string }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(budget)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleMarkAsPaid() {
    setLoading(true)
    try {
      const result = await markBookingAsPaid({
        bookingId,
        amount,
        notes,
      })
      if (result.success) {
        toast.success('Booking marked as paid!')
        setOpen(false)
      }
    } catch (error) {
      toast.error('Failed to mark as paid')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark as Paid
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Booking as Paid</DialogTitle>
          <DialogDescription>
            Record payment for this completed booking
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment details, remarks..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleMarkAsPaid} disabled={loading}>
            {loading ? 'Marking...' : 'Confirm Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}



