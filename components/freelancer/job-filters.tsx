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
  ChevronDown,
  Check
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { JOB_TYPE_OPTIONS, getJobTypeLabel } from '@/lib/constants/job-types'
import { LocationAutocomplete, LocationData } from '@/components/shared/location-autocomplete'

export interface FilterState {
  search: string
  locationSearch: string
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
    locationSearch: '',
    jobTypes: [],
    minBudget: '',
    maxBudget: '',
    sortBy: 'recent'
  })

  // Use predefined job types for filter options
  const allJobTypes = JOB_TYPE_OPTIONS

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

    // Location filter (search by city/location text)
    if (filters.locationSearch) {
      const locationLower = filters.locationSearch.toLowerCase()
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(locationLower) ||
        job.locationCity?.toLowerCase().includes(locationLower)
      )
    }

    // Job type filter - check if any of the job's types match any selected filter
    if (filters.jobTypes.length > 0) {
      filtered = filtered.filter(job => 
        job.jobTypes.some(jobType => filters.jobTypes.includes(jobType))
      )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, jobs])

  // No longer needed - using text search instead
  // const handleLocationToggle = (location: string) => {
  //   setFilters(prev => ({
  //     ...prev,
  //     locations: prev.locations.includes(location)
  //       ? prev.locations.filter(l => l !== location)
  //       : [...prev.locations, location]
  //   }))
  // }

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
      locationSearch: '',
      jobTypes: [],
      minBudget: '',
      maxBudget: '',
      sortBy: 'recent'
    })
  }

  const activeFilterCount = 
    (filters.locationSearch ? 1 : 0) +
    (filters.jobTypes.length > 0 ? 1 : 0) +
    (filters.minBudget || filters.maxBudget ? 1 : 0)

  const removeFilterChip = (type: 'location' | 'jobType' | 'budget', value?: string) => {
    if (type === 'location') {
      setFilters(prev => ({ ...prev, locationSearch: '' }))
    } else if (type === 'jobType' && value) {
      handleJobTypeToggle(value)
    } else if (type === 'budget') {
      setFilters(prev => ({ ...prev, minBudget: '', maxBudget: '' }))
    }
  }

  return (
    <div className="space-y-3">
      {/* Search Bar & Filter Button */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="pl-10 h-10 text-sm placeholder:text-sm bg-white"
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="default"
              className="h-10 px-4 gap-2 relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-blue-600">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-auto max-h-[92vh] px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
            hideClose
          >
            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 pt-6 pb-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="pr-12">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <SlidersHorizontal className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <SheetTitle className="text-2xl font-bold text-white mb-2">
                  Filters
                </SheetTitle>
                
                <SheetDescription className="text-blue-50 text-base">
                  Refine your job search with these filters
                </SheetDescription>
              </div>
            </div>

            {/* Filter Content */}
            <div className="px-6 pt-6 pb-safe bg-white overflow-y-auto max-h-[70vh] space-y-6">
              {/* Location Search */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <Label className="text-base font-semibold">Location</Label>
                </div>
                <LocationAutocomplete
                  value={filters.locationSearch}
                  onChange={(locationData: LocationData) => {
                    // Store the city name for filtering
                    setFilters(prev => ({ 
                      ...prev, 
                      locationSearch: locationData.city || locationData.formatted 
                    }))
                  }}
                  placeholder="Search by city..."
                  restrictToCities={true}
                  className=""
                />
                <p className="text-xs text-gray-500 mt-2">
                  Select a city from the suggestions to filter jobs
                </p>
              </div>

              {/* Job Type Filter */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <Label className="text-base font-semibold">Job Type</Label>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal"
                    >
                      <span className="truncate">
                        {filters.jobTypes.length === 0 ? (
                          <span className="text-gray-500">Select job types...</span>
                        ) : filters.jobTypes.length === 1 ? (
                          getJobTypeLabel(filters.jobTypes[0] as any)
                        ) : (
                          `${filters.jobTypes.length} types selected`
                        )}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full min-w-[280px] p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                    <div className="max-h-[300px] overflow-y-auto">
                      {allJobTypes.map((jobType) => (
                        <div
                          key={jobType.value}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors",
                            filters.jobTypes.includes(jobType.value) && "bg-blue-50"
                          )}
                          onClick={() => handleJobTypeToggle(jobType.value)}
                        >
                          <Checkbox
                            checked={filters.jobTypes.includes(jobType.value)}
                            onCheckedChange={() => handleJobTypeToggle(jobType.value)}
                            className="pointer-events-none"
                          />
                          <span className="text-sm flex-1">{jobType.label}</span>
                          {filters.jobTypes.includes(jobType.value) && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {filters.jobTypes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {filters.jobTypes.length} type{filters.jobTypes.length !== 1 ? 's' : ''} selected
                  </p>
                )}
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 sticky bottom-0 bg-white pb-6 border-t">
                {activeFilterCount > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                )}
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filter Chips */}
      {(filters.locationSearch || filters.jobTypes.length > 0 || filters.minBudget || filters.maxBudget) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Active filters:</span>
          
          {filters.locationSearch && (
            <Badge 
              variant="secondary" 
              className="gap-1 pr-1 pl-3 py-1.5 cursor-pointer hover:bg-gray-200"
              onClick={() => removeFilterChip('location')}
            >
              <MapPin className="w-3 h-3" />
              {filters.locationSearch}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          
          {filters.jobTypes.map(jobType => (
            <Badge 
              key={jobType} 
              variant="secondary" 
              className="gap-1 pr-1 pl-3 py-1.5 cursor-pointer hover:bg-gray-200"
              onClick={() => removeFilterChip('jobType', jobType)}
            >
              <Briefcase className="w-3 h-3" />
              {getJobTypeLabel(jobType as any)}
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
