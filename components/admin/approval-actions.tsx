'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { approveProfile, rejectProfile } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ApprovalActionsProps {
  profileId: string
  userId: string
  userEmail: string
  profileType: 'company' | 'freelancer'
  profileName: string
}

export function ApprovalActions({ profileId, userId, userEmail, profileType, profileName }: ApprovalActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  async function handleApprove() {
    setLoading(true)
    setShowApproveDialog(false)
    
    try {
      await approveProfile(profileId, profileType)
      toast.success(
        `${profileName}'s profile has been approved! They will receive an email notification.`,
        { duration: 5000 }
      )
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve profile')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    setLoading(true)
    setShowRejectDialog(false)
    
    try {
      await rejectProfile(profileId, profileType)
      toast.success(`${profileName}'s profile has been rejected.`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 pt-6 border-t">
        <Button
          onClick={() => setShowApproveDialog(true)}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
          size="lg"
        >
          <Check className="w-5 h-5 mr-2" />
          {loading ? 'Processing...' : 'Approve Profile'}
        </Button>
        <Button
          onClick={() => setShowRejectDialog(true)}
          disabled={loading}
          variant="destructive"
          className="flex-1 shadow-md"
          size="lg"
        >
          <X className="w-5 h-5 mr-2" />
          Reject Profile
        </Button>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <AlertDialogTitle className="text-xl">Approve Profile</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2 text-base">
              <p>
                You are about to approve <span className="font-semibold text-gray-900">{profileName}</span>&apos;s {profileType} profile.
              </p>
              <p className="text-sm">
                An email notification will be sent to <span className="font-medium">{userEmail}</span> confirming their approval.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Reject Profile</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-2 text-base">
              <p className="text-red-600 font-medium">
                This action cannot be undone.
              </p>
              <p>
                You are about to reject <span className="font-semibold text-gray-900">{profileName}</span>&apos;s {profileType} profile.
              </p>
              <p className="text-sm">
                The user at <span className="font-medium">{userEmail}</span> will need to create a new profile if they wish to reapply.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="w-4 h-4 mr-2" />
              Reject Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

