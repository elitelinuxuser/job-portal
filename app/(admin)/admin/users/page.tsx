import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'

export default async function UsersPage() {
  const allUsers = await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
    with: {
      companyProfile: true,
      freelancerProfile: true,
    },
  })

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

  function getOnboardingBadgeColor(status: string) {
    return status === 'complete'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-gray-600 mt-1">Manage all platform users</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getOnboardingBadgeColor(user.onboardingStatus)}>
                      {user.onboardingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'company' && user.companyProfile ? (
                      <span className="text-sm text-gray-600">
                        {user.companyProfile.companyName}
                      </span>
                    ) : user.role === 'freelancer' && user.freelancerProfile ? (
                      <span className="text-sm text-gray-600">
                        {user.freelancerProfile.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">No profile</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

