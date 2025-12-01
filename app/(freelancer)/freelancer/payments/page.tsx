import { getFreelancerPayments } from '@/lib/actions/freelancer'
import { FreelancerPaymentsList } from '@/components/freelancer/payments-list'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle2, IndianRupee, AlertTriangle } from 'lucide-react'

export default async function FreelancerPaymentsPage() {
  const payments = await getFreelancerPayments()

  const pendingPayments = payments.filter((p) => p.status === 'pending')
  const awaitingConfirmationPayments = payments.filter((p) => p.status === 'awaiting_confirmation')
  const paidPayments = payments.filter((p) => p.status === 'paid')
  const disputedPayments = payments.filter((p) => p.status === 'disputed')

  // Calculate total earnings (paid payments)
  const totalEarnings = paidPayments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-linear-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IndianRupee className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-bold">Payment Management</h1>
              <p className="text-sm text-green-100">Track and manage all your payments</p>
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
                  <p className="text-xs font-medium text-amber-600">Pending</p>
                  <p className="text-xl font-bold text-amber-900">{pendingPayments.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600">Awaiting</p>
                  <p className="text-xl font-bold text-blue-900">{awaitingConfirmationPayments.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600">Paid</p>
                  <p className="text-xl font-bold text-green-900">{paidPayments.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-600">Disputed</p>
                  <p className="text-xl font-bold text-red-900">{disputedPayments.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total Earnings Card */}
        <div className="mt-4">
          <Card className="border-2 shadow-lg bg-linear-to-br from-green-50 to-emerald-50">
            <CardContent className="px-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Total Earnings</p>
                  <p className="text-xl font-bold text-gray-900">{totalEarnings.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payments List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <FreelancerPaymentsList payments={payments} />
      </div>
    </div>
  )
}
