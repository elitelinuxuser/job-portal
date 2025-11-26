import { Card } from '@/components/ui/card'

export default function PostJobLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-6 md:py-12">
      <div className="max-w-3xl mx-auto px-0 sm:px-6 lg:px-8">
        {/* Header Section Skeleton */}
        <div className="mb-6 md:mb-8 text-center px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg mb-3 md:mb-4 animate-pulse" />
          <div className="h-10 md:h-12 w-80 mx-auto bg-gray-200 rounded-lg mb-2 md:mb-3 animate-pulse" />
          <div className="h-6 w-96 mx-auto bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Form Card Skeleton */}
        <Card className="rounded-none sm:rounded-lg p-4 sm:p-6 md:p-8 shadow-none sm:shadow-xl border-t-4 border-t-blue-600 border-x-0 sm:border-x mb-6 md:mb-0">
          <div className="space-y-6">
            {/* Job Title Field */}
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            </div>

            {/* Description Field */}
            <div className="space-y-3">
              <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            </div>

            {/* Location & Budget */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Job Type & Time */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 animate-pulse" />
            </div>

            {/* Contract Terms */}
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-white rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3">
              <div className="h-6 w-56 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <div className="h-14 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg animate-pulse" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
