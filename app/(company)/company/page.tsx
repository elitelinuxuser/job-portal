import { getCompanyJobs } from '@/lib/actions/jobs'
import { getCompanyProfile } from '@/lib/actions/company'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Plus, 
  Briefcase, 
  TrendingUp,
  FileText
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { JobsListWithTabs } from '@/components/company/jobs-list-with-tabs'

export default async function CompanyDashboard() {
  const profile = await getCompanyProfile()
  const jobs = await getCompanyJobs()

  if (!profile) {
    return null // Will redirect to onboarding via middleware
  }

  // Redirect to pending page if not verified
  if (profile.verificationStatus === 'pending') {
    redirect('/company/pending')
  }

  // Calculate stats
  const activeJobs = jobs.filter(job => job.isActive).length
  const totalResponses = jobs.reduce((sum, job) => sum + job.responses.length, 0)

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <Badge
                variant={profile.verificationStatus === 'verified' ? 'default' : 'secondary'}
                className={`mb-3 ${profile.verificationStatus === 'verified' ? 'bg-green-500 text-white' : 'bg-yellow-100 text-yellow-800'}`}
              >
                {profile.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending'}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {profile.companyName}!
              </h1>
              <p className="text-indigo-100 text-lg">
                Manage your job postings and connect with talented creatives
              </p>
            </div>
            <Link href="/company/post-job">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Post New Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{jobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Jobs</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{activeJobs}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Responses</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{totalResponses}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Jobs List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Job Postings</h2>
          <p className="text-gray-600 mt-1">Manage and track your listings</p>
        </div>

        <JobsListWithTabs jobs={jobs as any} />
      </section>
    </div>
  )
}



