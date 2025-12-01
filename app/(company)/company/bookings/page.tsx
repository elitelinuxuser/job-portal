import { getCompanyBookings } from '@/lib/actions/jobs'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle2, Package } from 'lucide-react'
import { BookingsList } from '@/components/company/bookings-list'

export default async function BookingsPage() {
  const bookings = await getCompanyBookings()

  const pendingBookings = bookings.filter((b) => b.status === 'pending')
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted')
  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const totalBookings = bookings.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-bold">Booking Management</h1>
              <p className="text-sm text-indigo-100">Track and manage all your freelancer bookings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">{totalBookings}</p>
                </div>
                <Package className="w-8 h-8 text-indigo-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600">Pending</p>
                  <p className="text-xl font-bold text-amber-900">{pendingBookings.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600">Accepted</p>
                  <p className="text-xl font-bold text-green-900">{acceptedBookings.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600">Completed</p>
                  <p className="text-xl font-bold text-blue-900">{completedBookings.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <BookingsList bookings={bookings} />
      </div>
    </div>
  )
}

