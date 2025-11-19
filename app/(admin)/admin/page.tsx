import { db } from '@/lib/db'
import { users, jobPosts, bookingRequests } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, Calendar, CheckCircle } from 'lucide-react'

export default async function AdminDashboard() {
  // Get platform metrics
  const [totalUsers] = await db.select({ count: count() }).from(users)
  const [adminUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'admin'))
  const [companyUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'company'))
  const [freelancerUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'freelancer'))
  const [totalJobs] = await db.select({ count: count() }).from(jobPosts)
  const [activeJobs] = await db.select({ count: count() }).from(jobPosts).where(eq(jobPosts.isActive, true))
  const [totalBookings] = await db.select({ count: count() }).from(bookingRequests)
  const [acceptedBookings] = await db.select({ count: count() }).from(bookingRequests).where(eq(bookingRequests.status, 'accepted'))
  const [pendingBookings] = await db.select({ count: count() }).from(bookingRequests).where(eq(bookingRequests.status, 'pending'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform overview and statistics</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyUsers.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Hiring companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Freelancers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{freelancerUsers.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active freelancers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Platform admins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All booking requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Bookings</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedBookings.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting response
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



