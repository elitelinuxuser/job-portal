import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Shimmer effect component
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  )
}

// Skeleton wrapper with shimmer
function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}>
      <Shimmer />
    </div>
  )
}

export function JobCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-200 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start gap-3">
              <SkeletonBox className="w-12 h-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="h-6 w-3/4" />
                <SkeletonBox className="h-4 w-1/2" />
              </div>
              <button className="opacity-50">
                <SkeletonBox className="w-6 h-6 rounded-full" />
              </button>
            </div>
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-5/6" />
          </div>
          <SkeletonBox className="h-12 w-28 rounded-full shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <SkeletonBox className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBox className="h-3 w-1/2" />
                  <SkeletonBox className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <SkeletonBox className="h-4 w-36" />
            <SkeletonBox className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FeaturedJobSkeleton() {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow group cursor-pointer">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <SkeletonBox className="h-7 w-24 rounded-full" />
          <SkeletonBox className="h-6 w-28 rounded-md" />
        </div>
        <SkeletonBox className="h-6 w-full" />
        <SkeletonBox className="h-6 w-4/5" />
        <div className="flex items-center gap-2 pt-2">
          <SkeletonBox className="w-4 h-4 rounded-sm" />
          <SkeletonBox className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-4 h-4 rounded-sm shrink-0" />
          <SkeletonBox className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-4 h-4 rounded-sm shrink-0" />
          <SkeletonBox className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

// Hero section skeleton
export function HeroSkeleton() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-3xl space-y-6">
          <SkeletonBox className="h-12 w-64 bg-white/20" />
          <div className="space-y-3">
            <SkeletonBox className="h-12 w-full bg-white/20" />
            <SkeletonBox className="h-12 w-3/4 bg-white/20" />
          </div>
          <SkeletonBox className="h-6 w-full bg-white/20" />
          <SkeletonBox className="h-6 w-4/5 bg-white/20" />
          
          <div className="grid grid-cols-3 gap-4 pt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <SkeletonBox className="h-8 w-16 mb-2 bg-white/20" />
                <SkeletonBox className="h-4 w-24 bg-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
