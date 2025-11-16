import { getInvites } from '@/lib/actions/invites'
import { CreateInviteDialog } from '@/components/admin/create-invite-dialog'
import { InvitesList } from '@/components/admin/invites-list'

export default async function InvitesPage() {
  const invites = await getInvites()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invitation Links</h1>
          <p className="text-gray-600 mt-1">Create and manage invitation links for new users</p>
        </div>
        <CreateInviteDialog />
      </div>

      <InvitesList invites={invites} />
    </div>
  )
}

