'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Heart, 
  MapPin, 
  Briefcase,
  Calendar, 
  Building2,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { JobFilters, FilterState } from './job-filters'
import { getJobTypeLabel } from '@/lib/constants/job-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Job {
  id: string
  title: string
  description: string
  budget: string | null
  jobTypes: string[]
  location: string
  locationCity?: string | null
  dates: Array<{ date: string; startTime?: string; endTime?: string }>
  createdAt: string | Date
  company: {
    companyProfile?: {
      companyName?: string
    }
  }
}

interface JobsListClientProps {
  initialJobs: Job[]
}

export function JobsListClient({ initialJobs }: JobsListClientProps) {
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs)
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(null)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())

  const handleFilterChange = (filters: FilterState, filtered: Job[]) => {
    setCurrentFilters(filters)
    setFilteredJobs(filtered)
  }

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    if (currentFilters) {
      const updatedFilters = { ...currentFilters, sortBy }
      setCurrentFilters(updatedFilters)
      // Re-apply filters with new sort
      let filtered = filteredJobs
      switch (sortBy) {
        case 'budget-high':
          filtered = [...filtered].sort((a, b) => parseFloat(b.budget || '0') - parseFloat(a.budget || '0'))
          break
        case 'budget-low':
          filtered = [...filtered].sort((a, b) => parseFloat(a.budget || '0') - parseFloat(b.budget || '0'))
          break
        case 'dates':
          filtered = [...filtered].sort((a, b) => b.dates.length - a.dates.length)
          break
        case 'recent':
        default:
          filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
      setFilteredJobs(filtered)
    }
  }

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <JobFilters 
        jobs={initialJobs}
        onFilterChange={handleFilterChange}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm text-gray-600 shrink-0">
          <span className="hidden sm:inline">Showing </span>
          <span className="font-semibold text-gray-900">{filteredJobs.length}</span>
          <span className="hidden sm:inline"> of {initialJobs.length}</span> jobs
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">Sort By:</span>
          <Select
            value={currentFilters?.sortBy || 'recent'}
            onValueChange={(value) => handleSortChange(value as FilterState['sortBy'])}
          >
            <SelectTrigger className="w-[140px] sm:w-[200px] h-8 sm:h-9 text-xs sm:text-sm bg-white border-gray-300">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="budget-high">Budget: High to Low</SelectItem>
              <SelectItem value="budget-low">Budget: Low to High</SelectItem>
              <SelectItem value="dates">Most Dates Available</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg text-gray-600 font-medium">No jobs match your filters</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Link key={job.id} href={`/freelancer/jobs/${job.id}`} className="block">
              <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-600 group cursor-pointer">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{job.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleSaveJob(job.id)
                          }}
                        >
                          <Heart 
                            className={`w-5 h-5 transition-colors ${
                              savedJobs.has(job.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-400 hover:text-red-500'
                            }`} 
                          />
                        </Button>
                      </div>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{job.company.companyProfile?.companyName || 'Company'}</span>
                    </CardDescription>
                    <p className="text-gray-600 line-clamp-2 mt-3">{job.description}</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-3 py-1 shrink-0">
                    ₹{job.budget || '0'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium text-gray-900 truncate">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-medium text-gray-900 truncate">
                          {job.jobTypes.slice(0, 2).map((type, idx) => (
                            <span key={type}>
                              {getJobTypeLabel(type as any)}
                              {idx < Math.min(job.jobTypes.length, 2) - 1 && ', '}
                            </span>
                          ))}
                          {job.jobTypes.length > 2 && ` +${job.jobTypes.length - 2} more`}
                        </p>
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

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
