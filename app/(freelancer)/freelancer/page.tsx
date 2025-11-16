import { getAllActiveJobs } from '@/lib/actions/freelancer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye, Calendar, MapPin, Briefcase } from 'lucide-react'
import { format } from 'date-fns'

export default async function FreelancerDashboard() {
  const jobs = await getAllActiveJobs()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Jobs</h1>
        <p className="text-gray-600 mt-1">Find your next photography/videography gig</p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No jobs available at the moment</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon for new opportunities</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {job.company.companyProfile?.companyName || 'Company'}
                    </CardDescription>
                  </div>
                  <Badge variant="default">₹{job.budget}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{(job.dates as string[]).length} date(s)</span>
                    </div>
                    <div className="text-gray-600">
                      <span>Time: {job.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Posted:</span>
                    <span className="text-sm">{format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                  </div>

                  <div className="pt-3 border-t">
                    <Link href={`/freelancer/jobs/${job.id}`}>
                      <Button className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

