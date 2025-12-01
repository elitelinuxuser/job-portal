import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function JobDetailLoading() {
  return (
    <>
      <div className="max-w-5xl mx-auto pb-32 md:pb-6">
        <div className="px-0 sm:px-6 lg:px-8 space-y-6">
          {/* Header Card Skeleton */}
          <Card className="rounded-none sm:rounded-lg border-t-4 border-t-gray-200 border-x-0 sm:border-x shadow-none sm:shadow-lg">
            <CardHeader className="space-y-4 pb-4">
              {/* Back Button Skeleton */}
              <Skeleton className="h-9 w-32 -ml-2" />
              
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-10 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-20" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description Skeleton */}
              <div>
                <Skeleton className="h-6 w-48 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* Key Details Grid Skeleton */}
              <div>
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <Skeleton className="w-10 h-10 rounded-lg bg-blue-200" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-16 bg-blue-200" />
                      <Skeleton className="h-5 w-24 bg-blue-300" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <Skeleton className="w-10 h-10 rounded-lg bg-purple-200" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-16 bg-purple-200" />
                      <Skeleton className="h-5 w-24 bg-purple-300" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 sm:col-span-2 lg:col-span-1">
                    <Skeleton className="w-10 h-10 rounded-lg bg-green-200" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-16 bg-green-200" />
                      <Skeleton className="h-5 w-24 bg-green-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Dates Skeleton */}
              <div>
                <Skeleton className="h-6 w-40 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-32" />
                  ))}
                </div>
              </div>

              {/* Contract Details Skeleton */}
              <div className="border-t pt-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Skeleton className="h-5 w-5 rounded bg-green-200" />
                      <Skeleton className="h-4 w-40 bg-green-200" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Posted Date Skeleton */}
              <div className="hidden md:block text-sm pt-4 border-t">
                <Skeleton className="h-4 w-48" />
              </div>
            </CardContent>
          </Card>

          {/* Apply Form Skeleton - Desktop */}
          <Card className="hidden md:block rounded-none sm:rounded-lg border-x-0 sm:border-x shadow-none sm:shadow-lg">
            <CardHeader>
              <Skeleton className="h-7 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom CTA Skeleton - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="p-4">
          <Skeleton className="w-full h-14" />
        </div>
      </div>
    </>
  )
}
