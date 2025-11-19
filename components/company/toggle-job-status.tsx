'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toggleJobStatus } from '@/lib/actions/jobs'
import { toast } from 'sonner'

export function ToggleJobStatus({ jobId, isActive }: { jobId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await toggleJobStatus(jobId)
      toast.success(`Job ${isActive ? 'deactivated' : 'activated'} successfully!`)
    } catch (error) {
      toast.error('Failed to update job status')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}
    </Button>
  )
}



