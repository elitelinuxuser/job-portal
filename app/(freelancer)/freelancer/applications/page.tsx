import { getMyApplications } from '@/lib/actions/freelancer'
import { ApplicationsWithTabs } from '@/components/freelancer/applications-with-tabs'
import { FileText } from 'lucide-react'

export default async function ApplicationsPage() {
  const applications = await getMyApplications()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header Section */}
      <section className="bg-linear-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-bold mb-1">
                My Applications
              </h1>
              <p className="text-blue-100">
                Track and manage your job applications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Applications List with Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ApplicationsWithTabs applications={applications} />
      </div>
    </div>
  )
}
