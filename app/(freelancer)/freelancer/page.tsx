import { getAllActiveJobs, getFreelancerProfile } from '@/lib/actions/freelancer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  TrendingUp,
  Star,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react'
import { JobsListClient } from '@/components/freelancer/jobs-list-client'
import { Suspense } from 'react'
import { JobCardSkeleton, FeaturedJobSkeleton } from '@/components/freelancer/job-card-skeleton'
import { getJobTypeLabel } from '@/lib/constants/job-types'

// Revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function FreelancerDashboard() {
  const jobs = await getAllActiveJobs()
  const profile = await getFreelancerProfile()

  // Get featured jobs (latest 3)
  const featuredJobs = jobs.slice(0, 3)

  const isPending = profile?.verificationStatus === 'pending'

  return (
    <div className="min-h-screen">
      {/* Pending Approval Banner */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  Profile Under Review
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    Pending
                  </Badge>
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  You can browse jobs while we verify your profile. You&apos;ll be able to apply once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Mobile-First Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="max-w-3xl">
            {/* Trust Badge */}
            {/* <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span className="text-sm font-medium">Premium Job Platform</span>
            </div> */}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              Find Your Next
              <span className="block text-cyan-200 mt-2">Creative Project</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-6 md:mb-8 leading-relaxed">
              Browse photography and videography gigs from top companies. Get hired for what you love to do.
            </p>

            {/* Stats - Compact on Mobile */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-cyan-200" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">{jobs.length}</p>
                <p className="text-xs md:text-sm text-blue-100">Active Jobs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 md:w-5 md:h-5 text-cyan-200" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">50+</p>
                <p className="text-xs md:text-sm text-blue-100">Companies</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-cyan-200" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">100+</p>
                <p className="text-xs md:text-sm text-blue-100">Jobs Posted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-2">
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Jobs</h2>
                </div>
                <p className="text-sm md:text-base text-gray-600">Hand-picked opportunities for you</p>
              </div>
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 fill-yellow-500" />
            </div>
            
            <Suspense fallback={
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <FeaturedJobSkeleton key={i} />)}
              </div>
            }>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredJobs.map((job) => (
                  <Link key={job.id} href={`/freelancer/jobs/${job.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-blue-500 group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                            ₹{job.budget}
                          </Badge>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {job.jobTypes.slice(0, 2).map((jobType) => (
                              <Badge key={jobType} variant="outline" className="text-xs">
                                {getJobTypeLabel(jobType as any)}
                              </Badge>
                            ))}
                            {job.jobTypes.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.jobTypes.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-base md:text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {job.company.companyProfile?.companyName || 'Company'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="line-clamp-1">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>{job.dates.length} date(s) available</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </Suspense>
          </div>
        </section>
      )}

      {/* All Jobs with Advanced Filtering */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">All Jobs</h2>
          <p className="text-sm md:text-base text-gray-600">Browse and filter available opportunities</p>
        </div>

        <Suspense fallback={
          <div className="space-y-6">
            {[1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
          </div>
        }>
          <JobsListClient initialJobs={jobs} />
        </Suspense>
      </section>
    </div>
  )
}

