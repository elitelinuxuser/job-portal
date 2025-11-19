'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createBookingRequest } from '@/lib/actions/jobs'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'

export function SendBookingRequest({
  jobId,
  freelancerId,
  freelancerName,
}: {
  jobId: string
  freelancerId: string
  freelancerName: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!confirm(`Send booking request to ${freelancerName}?`)) {
      return
    }

    setLoading(true)
    try {
      const result = await createBookingRequest({ jobId, freelancerId })
      if (result.success) {
        toast.success('Booking request sent successfully!')
      }
    } catch (error) {
      toast.error('Failed to send booking request')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSend} disabled={loading}>
      <Calendar className="w-4 h-4 mr-2" />
      {loading ? 'Sending...' : 'Send Booking Request'}
    </Button>
  )
}



