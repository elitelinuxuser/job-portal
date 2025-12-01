'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { toggleJobStatus } from '@/lib/actions/jobs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CompanyJobActions({ jobId, isActive }: { jobId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    try {
      await toggleJobStatus(jobId)
      toast.success(`Job ${isActive ? 'deactivated' : 'activated'} successfully!`)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update job status')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggle} disabled={loading}>
          {loading ? 'Updating...' : isActive ? 'Deactivate Job' : 'Activate Job'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
