'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { deleteInvite } from '@/lib/actions/invites'
import { format } from 'date-fns'

export function InvitesList({ invites }: { invites: any[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function getInviteUrl(code: string) {
    return `${window.location.origin}/sign-up?invite=${code}`
  }

  async function copyInviteUrl(code: string) {
    const url = getInviteUrl(code)
    await navigator.clipboard.writeText(url)
    toast.success('Invite link copied to clipboard!')
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this invite?')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteInvite(id)
      toast.success('Invite deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete invite')
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'company':
        return 'bg-blue-100 text-blue-800'
      case 'freelancer':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid gap-4">
      {invites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">No invites created yet</p>
            <p className="text-sm text-gray-400">Create your first invite to get started</p>
          </CardContent>
        </Card>
      ) : (
        invites.map((invite) => (
          <Card key={invite.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getRoleBadgeColor(invite.role)}>
                    {invite.role}
                  </Badge>
                  <Badge className={getStatusBadgeColor(invite.status)}>
                    {invite.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {invite.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteUrl(invite.code)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(getInviteUrl(invite.code), '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(invite.id)}
                    disabled={deletingId === invite.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invite Code:</span>
                  <span className="font-mono text-xs">{invite.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{format(new Date(invite.createdAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
                {invite.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span>{format(new Date(invite.expiresAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
                {invite.usedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used At:</span>
                    <span>{format(new Date(invite.usedAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

