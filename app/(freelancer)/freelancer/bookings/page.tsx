import { getFreelancerBookings } from '@/lib/actions/freelancer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AcceptBookingDialog } from '@/components/freelancer/accept-booking-dialog'
import { RejectBookingButton } from '@/components/freelancer/reject-booking-button'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function FreelancerBookingsPage() {
  const bookings = await getFreelancerBookings()

  const pendingBookings = bookings.filter((b) => b.status === 'pending')
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted')
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const rejectedBookings = bookings.filter((b) => b.status === 'rejected')

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Accepted</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  function BookingCard({ booking }: { booking: any }) {
    const contract = booking.contractDetails as any

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{contract.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Company: {booking.company.companyProfile?.companyName || 'Unknown'}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="ml-2 font-medium">{contract.location}</span>
              </div>
              <div>
                <span className="text-gray-600">Budget:</span>
                <span className="ml-2 font-medium">₹{contract.budget}</span>
              </div>
              <div>
                <span className="text-gray-600">Time:</span>
                <span className="ml-2 font-medium">{contract.time}</span>
              </div>
              <div>
                <span className="text-gray-600">Job Type:</span>
                <span className="ml-2 font-medium">{contract.jobType}</span>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600">Dates:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {contract.dates.map((date: string, idx: number) => (
                  <Badge key={idx} variant="outline">{date}</Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600">Contact:</span>
              <span className="ml-2 text-sm font-medium">
                {booking.company.companyProfile?.whatsappNumber}
              </span>
            </div>

            <div className="pt-3 border-t text-sm text-gray-600">
              Requested: {format(new Date(booking.createdAt), 'MMM d, yyyy HH:mm')}
            </div>

            {booking.status === 'pending' && (
              <div className="pt-3 flex gap-3">
                <RejectBookingButton bookingId={booking.id} />
                <AcceptBookingDialog booking={booking} />
              </div>
            )}

            {booking.payments.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold mb-2">Payment</h4>
                {booking.payments.map((payment: any) => (
                  <div key={payment.id} className="text-sm">
                    <div className="flex justify-between">
                      <span>Amount: ₹{payment.amount}</span>
                      <span>{format(new Date(payment.paidAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600 mt-1">Manage your booking requests</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No pending booking requests
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {acceptedBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No accepted bookings
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {acceptedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No completed bookings
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No rejected bookings
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rejectedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}



