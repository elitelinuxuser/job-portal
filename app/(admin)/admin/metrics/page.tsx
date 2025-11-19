import { db } from '@/lib/db'
import { users, jobPosts, bookingRequests, jobResponses } from '@/lib/db/schema'
import { eq, count, and, gte } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react'

export default async function MetricsPage() {
  // User metrics
  const [totalUsers] = await db.select({ count: count() }).from(users)
  const [companyUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'company'))
  const [freelancerUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, 'freelancer'))
  const [incompleteOnboarding] = await db.select({ count: count() }).from(users).where(eq(users.onboardingStatus, 'incomplete'))
  
  // Job metrics
  const [totalJobs] = await db.select({ count: count() }).from(jobPosts)
  const [activeJobs] = await db.select({ count: count() }).from(jobPosts).where(eq(jobPosts.isActive, true))
  
  // Booking metrics
  const [totalBookings] = await db.select({ count: count() }).from(bookingRequests)
  const [acceptedBookings] = await db.select({ count: count() }).from(bookingRequests).where(eq(bookingRequests.status, 'accepted'))
  const [pendingBookings] = await db.select({ count: count() }).from(bookingRequests).where(eq(bookingRequests.status, 'pending'))
  const [rejectedBookings] = await db.select({ count: count() }).from(bookingRequests).where(eq(bookingRequests.status, 'rejected'))
  const [completedBookings] = await db.select({ count: count() }).from(bookingRequests).where(eq(bookingRequests.status, 'completed'))
  
  // Response metrics
  const [totalResponses] = await db.select({ count: count() }).from(jobResponses)
  const [interestedResponses] = await db.select({ count: count() }).from(jobResponses).where(eq(jobResponses.status, 'interested'))
  
  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const [recentUsers] = await db.select({ count: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo))
  const [recentJobs] = await db.select({ count: count() }).from(jobPosts).where(gte(jobPosts.createdAt, sevenDaysAgo))
  const [recentBookings] = await db.select({ count: count() }).from(bookingRequests).where(gte(bookingRequests.createdAt, sevenDaysAgo))

  const acceptanceRate = totalBookings.count > 0 
    ? ((acceptedBookings.count / totalBookings.count) * 100).toFixed(1)
    : '0.0'
  
  const onboardingCompletionRate = totalUsers.count > 0
    ? (((totalUsers.count - incompleteOnboarding.count) / totalUsers.count) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Metrics</h1>
        <p className="text-gray-600 mt-1">Detailed statistics and analytics</p>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity (Last 7 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentUsers.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Joined in the last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentJobs.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Posted in the last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentBookings.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Created in the last week
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companyUsers.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Freelancers</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freelancerUsers.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onboardingCompletionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Onboarding completed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Job Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobs.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeJobs.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interested</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interestedResponses.count}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Booking Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedBookings.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBookings.count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptanceRate}%</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



