'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { respondToJob } from '@/lib/actions/freelancer'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export function RespondToJobForm({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleRespond(status: 'interested' | 'not_interested') {
    setLoading(true)
    try {
      const result = await respondToJob({
        jobId,
        status,
        message: status === 'interested' ? message : undefined,
      })

      if (result.success) {
        toast.success(
          status === 'interested'
            ? 'Interest submitted! The company will review your application.'
            : 'Marked as not interested'
        )
        router.push('/freelancer')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit response')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="message">Message to Company (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself and explain why you're a good fit..."
          rows={4}
          className="mt-2"
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleRespond('not_interested')}
          disabled={loading}
        >
          <ThumbsDown className="w-4 h-4 mr-2" />
          Not Interested
        </Button>
        <Button
          className="flex-1"
          onClick={() => handleRespond('interested')}
          disabled={loading}
        >
          <ThumbsUp className="w-4 h-4 mr-2" />
          {loading ? 'Submitting...' : "I'm Interested"}
        </Button>
      </div>
    </div>
  )
}

