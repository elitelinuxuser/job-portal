import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function JobDetailLoading() {
  return (
    <>
      <div className="max-w-5xl mx-auto pb-32 md:pb-6">
        <div className="px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" className="gap-2 -ml-2" disabled>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Jobs</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Header Card Skeleton */}
          <Card className="border-t-4 border-t-gray-200 shadow-lg">
            <CardHeader className="space-y-4 pb-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-10 w-24 shrink-0" />
                </div>
                <Skeleton className="h-5 w-1/3" />
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
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
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  ))}
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
              <div>
                <Skeleton className="h-6 w-40 mb-3" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Posted Date Skeleton */}
              <div className="hidden md:block pt-4 border-t">
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>

          {/* Apply Form Skeleton - Desktop */}
          <Card className="hidden md:block">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
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
