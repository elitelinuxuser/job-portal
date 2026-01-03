import { getReports } from '@/lib/actions/reports'
import { ReportsClient } from '@/components/admin/reports-client'

export default async function AdminReportsPage() {
  const reports = await getReports()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">
          Review and manage user reports for job posts, freelancers, and companies.
        </p>
      </div>

      <ReportsClient reports={reports} />
    </div>
  )
}
