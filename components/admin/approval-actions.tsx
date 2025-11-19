'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { approveProfile, rejectProfile } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'

interface ApprovalActionsProps {
  profileId: string
  userId: string
  userEmail: string
  profileType: 'company' | 'freelancer'
}

export function ApprovalActions({ profileId, userId, userEmail, profileType }: ApprovalActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    if (!confirm(`Approve ${profileType} profile for ${userEmail}?`)) {
      return
    }

    setLoading(true)
    try {
      await approveProfile(profileId, profileType)
      toast.success(`${profileType === 'company' ? 'Company' : 'Freelancer'} profile approved!`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!confirm(`Reject ${profileType} profile for ${userEmail}? This action cannot be undone.`)) {
      return
    }

    setLoading(false)
    try {
      await rejectProfile(profileId, profileType)
      toast.success(`${profileType === 'company' ? 'Company' : 'Freelancer'} profile rejected`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 pt-4 border-t">
      <Button
        onClick={handleApprove}
        disabled={loading}
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        <Check className="w-4 h-4 mr-2" />
        Approve
      </Button>
      <Button
        onClick={handleReject}
        disabled={loading}
        variant="destructive"
        className="flex-1"
      >
        <X className="w-4 h-4 mr-2" />
        Reject
      </Button>
    </div>
  )
}

