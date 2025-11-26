'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Eye, 
  MapPin, 
  Calendar, 
  Briefcase, 
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { ToggleJobStatus } from '@/components/company/toggle-job-status'

interface Job {
  id: string
  title: string
  description: string
  location: string
  budget: string
  jobType: string
  dates: string[]
  isActive: boolean
  status: 'active' | 'completed' | 'cancelled' | 'booked'
  createdAt: Date
  responses: { id: string }[]
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
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{job.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge 
                        variant={job.isActive ? 'default' : 'secondary'} 
                        className={`${job.isActive ? 'bg-green-600' : 'bg-gray-400'} text-white`}
                      >
                        {job.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <ToggleJobStatus jobId={job.id} isActive={job.isActive} />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Job Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium text-gray-900 truncate">{job.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Dates</p>
                          <p className="font-medium text-gray-900">{job.dates.length} day(s)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="font-medium text-gray-900 truncate">{job.jobType}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Budget</p>
                          <p className="font-medium text-emerald-600">₹{job.budget}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dates Display */}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Scheduled Dates:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.dates.slice(0, 5).map((date, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {date}
                          </Badge>
                        ))}
                        {job.dates.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.dates.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <span className="font-semibold text-indigo-600">{job.responses.length}</span>
                          <span className="text-gray-600"> response{job.responses.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <Link href={`/company/responses?job=${job.id}`} className="block">
                        <Button className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View Responses
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
    </div>
  )
}
