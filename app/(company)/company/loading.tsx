import { Card, CardContent } from '@/components/ui/card'

export default function CompanyLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Section Skeleton */}
      <section className="bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="h-6 w-24 bg-white/20 rounded-full mb-3 animate-pulse" />
              <div className="h-10 w-80 bg-white/20 rounded-lg mb-2 animate-pulse" />
              <div className="h-6 w-96 bg-white/10 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 w-48 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Cards Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-8">
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="h-8 w-16 bg-gray-300 rounded animate-pulse" />
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Jobs List Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 w-64 bg-gray-200 rounded-lg mb-2 animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                  <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

