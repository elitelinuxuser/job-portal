import { HeroSkeleton, FeaturedJobSkeleton, JobCardSkeleton } from '@/components/freelancer/job-card-skeleton'

export default function FreelancerLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <HeroSkeleton />

      {/* Featured Jobs Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-2">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
              <div className="h-5 w-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <FeaturedJobSkeleton key={i} />)}
          </div>
        </div>
      </section>

      {/* All Jobs Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
          <div className="h-5 w-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
        </div>

        {/* Search and Filter Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 h-11 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
          <div className="h-11 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Job Cards Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
        </div>
      </section>
    </div>
  )
}

