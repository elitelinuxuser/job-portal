import { getCompanyPayments } from '@/lib/actions/company'
import { CompanyPaymentsList } from '@/components/company/company-payments-list'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CheckCircle2, IndianRupee, XCircle } from 'lucide-react'

export default async function CompanyPaymentsPage() {
  const payments = await getCompanyPayments()

  const pendingPayments = payments.filter((p) => p.status === 'pending')
  const awaitingConfirmationPayments = payments.filter((p) => p.status === 'awaiting_confirmation')
  const paidPayments = payments.filter((p) => p.status === 'paid')
  const declinedPayments = payments.filter((p) => p.status === 'declined')

  // Calculate total paid (completed payments)
  const totalPaid = paidPayments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-linear-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IndianRupee className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-bold">Payment Management</h1>
              <p className="text-sm text-blue-100">Track and manage all your payments</p>
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
                  <p className="text-xs font-medium text-gray-600">Declined</p>
                  <p className="text-xl font-bold text-gray-900">{declinedPayments.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-gray-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4">
          <Card className="border-2 shadow-lg bg-linear-to-br from-blue-50 to-cyan-50">
            <CardContent className="px-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Paid</p>
                  <p className="text-xl font-bold text-gray-900">{totalPaid.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payments List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <CompanyPaymentsList payments={payments} />
      </div>
    </div>
  )
}
