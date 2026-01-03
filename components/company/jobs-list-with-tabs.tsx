'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { 
  MapPin, 
  Calendar, 
  Briefcase, 
  ArrowRight,
  MessageSquare,
  Plus,
  MoreVertical,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { getJobTypeLabel, JobType } from '@/lib/constants/job-types'
import { toggleJobStatus } from '@/lib/actions/jobs'
import { toast } from 'sonner'

export interface Job {
  id: string
  title: string
  description: string
  location: string
  locationFormatted?: string | null
  budget: string
  jobTypes: JobType[]
  dates: Array<{ date: string; startTime?: string; endTime?: string }>
  isActive: boolean
  status: 'active' | 'completed' | 'cancelled' | 'booked'
  createdAt: Date
  responses: { id: string }[]
  unreadResponseCount?: number
}

interface JobsListWithTabsProps {
  jobs: Job[]
}

export function JobsListWithTabs({ jobs }: JobsListWithTabsProps) {
  const [activeTab, setActiveTab] = useState('active')

  // Filter jobs based on tab
  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'active') return job.isActive && job.status === 'active'
    if (activeTab === 'completed') return job.status === 'completed'
    if (activeTab === 'inactive') return !job.isActive
    return true
  })

  const activeCount = jobs.filter(job => job.isActive && job.status === 'active').length
  const completedCount = jobs.filter(job => job.status === 'completed').length
  const inactiveCount = jobs.filter(job => !job.isActive).length

  if (jobs.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Start finding talented photographers and videographers by posting your first job
          </p>
          <Link href="/company/post-job">
            <Button size="lg" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              <Plus className="w-5 h-5 mr-2" />
              Post Your First Job
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full">
      {/* Custom Pills Navigation */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Active</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Completed</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {completedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'inactive'
              ? 'bg-gray-700 text-white shadow-lg shadow-gray-700/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Inactive</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'inactive' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {inactiveCount}
          </span>
        </button>
      </div>

      {/* Content */}
      <div>
        {filteredJobs.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No jobs found in this category</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Link href={`/company/jobs/${job.id}`} className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                        {job.title}
                      </CardTitle>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              await toggleJobStatus(job.id)
                              toast.success(`Job ${job.isActive ? 'deactivated' : 'activated'} successfully!`)
                            } catch (error) {
                              toast.error('Failed to update job status')
                              console.error(error)
                            }
                          }}
                        >
                          {job.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant={job.isActive ? 'default' : 'secondary'} 
                      className={`${job.isActive ? 'bg-green-600' : 'bg-gray-400'} text-white text-xs`}
                    >
                      {job.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge className="bg-linear-to-r from-green-600 to-emerald-600 text-white font-bold px-3 py-1 text-xs whitespace-nowrap">
                      ₹{parseFloat(job.budget).toLocaleString('en-IN')}
                    </Badge>
                  </div>
                  <Link href={`/company/jobs/${job.id}`}>
                    <p className="text-gray-600 line-clamp-2 text-sm">{job.description}</p>
                  </Link>
                </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium text-gray-900 truncate">{job.locationFormatted || job.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Type</p>
                            {job.jobTypes.length > 0 && (
                              <p className="font-medium text-gray-900 truncate">
                                {getJobTypeLabel(job.jobTypes[0])}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Events</p>
                            <p className="font-medium text-gray-900">{job.dates.length} day(s)</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="relative">
                              <MessageSquare className="w-4 h-4 text-gray-700" />
                              {(job.unreadResponseCount ?? 0) > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <span className="font-semibold text-gray-700">{job.responses.length}</span>
                            <span className="text-gray-700">response{job.responses.length !== 1 ? 's' : ''}</span>
                            {(job.unreadResponseCount ?? 0) > 0 && (
                              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0 h-5">
                                {job.unreadResponseCount} new
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/company/jobs/${job.id}`} className="flex-1">
                            <Button className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                              <ArrowRight className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/company/responses?job=${job.id}`} className="flex-1">
                            <Button variant="outline" className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                              <Eye className="w-4 h-4 mr-2" />
                              View Responses
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
