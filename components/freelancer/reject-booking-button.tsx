'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { respondToBooking } from '@/lib/actions/freelancer'
import { toast } from 'sonner'
import { XCircle } from 'lucide-react'

export function RejectBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleReject() {
    setLoading(true)
    try {
      const result = await respondToBooking({
        bookingId,
        accept: false,
      })
      if (result.success) {
        toast.success('Booking request declined')
        window.location.reload()
      }
    } catch (error) {
      toast.error('Failed to decline booking')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <XCircle className="w-4 h-4 mr-2" />
          Decline
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Decline Booking Request?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to decline this booking request? This action cannot be undone.
            The company will be notified of your decision.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReject} disabled={loading}>
            {loading ? 'Declining...' : 'Yes, Decline'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

