'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  SlidersHorizontal, 
  X,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface FilterState {
  search: string
  locations: string[]
  jobTypes: string[]
  minBudget: string
  maxBudget: string
  sortBy: 'recent' | 'budget-high' | 'budget-low' | 'dates'
}

interface JobFiltersProps {
  jobs: any[]
  onFilterChange: (filters: FilterState, filteredJobs: any[]) => void
}

export function JobFilters({ jobs, onFilterChange }: JobFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    locations: [],
    jobTypes: [],
    minBudget: '',
    maxBudget: '',
    sortBy: 'recent'
  })

  // Extract unique values
  const allLocations = Array.from(new Set(jobs.map(job => job.location)))
  const allJobTypes = Array.from(new Set(jobs.map(job => job.jobType)))

  // Apply filters
  useEffect(() => {
    let filtered = [...jobs]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.company.companyProfile?.companyName?.toLowerCase().includes(searchLower)
      )
    }

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(job => filters.locations.includes(job.location))
    }

    // Job type filter
    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter(job => filters.jobTypes.includes(job.jobType))
    }

    // Budget filter
    if (filters.minBudget) {
      const min = parseFloat(filters.minBudget)
      filtered = filtered.filter(job => job.budget && parseFloat(job.budget) >= min)
    }
    if (filters.maxBudget) {
      const max = parseFloat(filters.maxBudget)
      filtered = filtered.filter(job => job.budget && parseFloat(job.budget) <= max)
    }

    // Sorting
    switch (filters.sortBy) {
      case 'budget-high':
        filtered.sort((a, b) => parseFloat(b.budget || '0') - parseFloat(a.budget || '0'))
        break
      case 'budget-low':
        filtered.sort((a, b) => parseFloat(a.budget || '0') - parseFloat(b.budget || '0'))
        break
      case 'dates':
        filtered.sort((a, b) => (b.dates as string[]).length - (a.dates as string[]).length)
        break
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    onFilterChange(filters, filtered)
  }, [filters, jobs])

  const handleLocationToggle = (location: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }))
  }

  const handleJobTypeToggle = (jobType: string) => {
    setFilters(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobType)
        ? prev.jobTypes.filter(t => t !== jobType)
        : [...prev.jobTypes, jobType]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      locations: [],
      jobTypes: [],
      minBudget: '',
      maxBudget: '',
      sortBy: 'recent'
    })
  }

  const activeFilterCount = 
    (filters.locations.length > 0 ? 1 : 0) +
    (filters.jobTypes.length > 0 ? 1 : 0) +
    (filters.minBudget || filters.maxBudget ? 1 : 0)

  const removeFilterChip = (type: 'location' | 'jobType' | 'budget', value?: string) => {
    if (type === 'location' && value) {
      handleLocationToggle(value)
    } else if (type === 'jobType' && value) {
      handleJobTypeToggle(value)
    } else if (type === 'budget') {
      setFilters(prev => ({ ...prev, minBudget: '', maxBudget: '' }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Button */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-11 h-12 text-base"
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="lg"
              className="h-12 px-6 gap-2 relative"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-blue-600">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl">Filters</SheetTitle>
              <SheetDescription>
                Refine your job search with these filters
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Location Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <Label className="text-base font-semibold">Location</Label>
                </div>
                <div className="space-y-2">
                  {allLocations.map(location => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={filters.locations.includes(location)}
                        onCheckedChange={() => handleLocationToggle(location)}
                      />
                      <label
                        htmlFor={`location-${location}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Type Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <Label className="text-base font-semibold">Job Type</Label>
                </div>
                <div className="space-y-2">
                  {allJobTypes.map(jobType => (
                    <div key={jobType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`jobType-${jobType}`}
                        checked={filters.jobTypes.includes(jobType)}
                        onCheckedChange={() => handleJobTypeToggle(jobType)}
                      />
                      <label
                        htmlFor={`jobType-${jobType}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {jobType}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="w-4 h-4 text-gray-600" />
                  <Label className="text-base font-semibold">Budget Range</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="minBudget" className="text-xs text-gray-600 mb-1">Min</Label>
                    <Input
                      id="minBudget"
                      type="number"
                      placeholder="0"
                      value={filters.minBudget}
                      onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxBudget" className="text-xs text-gray-600 mb-1">Max</Label>
                    <Input
                      id="maxBudget"
                      type="number"
                      placeholder="100000"
                      value={filters.maxBudget}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <Label className="text-base font-semibold">Sort By</Label>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'recent', label: 'Most Recent' },
                    { value: 'budget-high', label: 'Budget: High to Low' },
                    { value: 'budget-low', label: 'Budget: Low to High' },
                    { value: 'dates', label: 'Most Dates Available' }
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sort-${option.value}`}
                        checked={filters.sortBy === option.value}
                        onCheckedChange={() => setFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                      />
                      <label
                        htmlFor={`sort-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear All */}
              {activeFilterCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filter Chips */}
      {(filters.locations.length > 0 || filters.jobTypes.length > 0 || filters.minBudget || filters.maxBudget) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Active filters:</span>
          
          {filters.locations.map(location => (
            <Badge 
              key={location} 
              variant="secondary" 
              className="gap-1 pr-1 pl-3 py-1.5 cursor-pointer hover:bg-gray-200"
              onClick={() => removeFilterChip('location', location)}
            >
              <MapPin className="w-3 h-3" />
              {location}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          
          {filters.jobTypes.map(jobType => (
            <Badge 
              key={jobType} 
              variant="secondary" 
              className="gap-1 pr-1 pl-3 py-1.5 cursor-pointer hover:bg-gray-200"
              onClick={() => removeFilterChip('jobType', jobType)}
            >
              <Briefcase className="w-3 h-3" />
              {jobType}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          
          {(filters.minBudget || filters.maxBudget) && (
            <Badge 
              variant="secondary" 
              className="gap-1 pr-1 pl-3 py-1.5 cursor-pointer hover:bg-gray-200"
              onClick={() => removeFilterChip('budget')}
            >
              <IndianRupee className="w-3 h-3" />
              ₹{filters.minBudget || '0'} - ₹{filters.maxBudget || '∞'}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}

          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
