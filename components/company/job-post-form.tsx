'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { createJobPost } from '@/lib/actions/jobs'
import { useRouter } from 'next/navigation'
import { Plus, X, Briefcase, FileText, MapPin, IndianRupee, Camera, Calendar, FileCheck, Sparkles } from 'lucide-react'
import { LocationAutocomplete, LocationData } from '@/components/shared/location-autocomplete'
import { JOB_TYPE_OPTIONS, JOB_TYPES } from '@/lib/constants/job-types'
import { CONTRACT_TERMS } from '@/lib/constants/contract-terms'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z.string().optional(),
  jobType: z.enum([
    JOB_TYPES.CANDID_PHOTOGRAPHER,
    JOB_TYPES.CINEMATOGRAPHER,
    JOB_TYPES.TRADITIONAL_PHOTOGRAPHER,
    JOB_TYPES.TRADITIONAL_VIDEOGRAPHER,
    JOB_TYPES.PHOTO_EDITOR,
    JOB_TYPES.VIDEO_EDITOR,
    JOB_TYPES.DRONE,
  ], { message: 'Please select a job type' }),
  contractAdditionalDetails: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface DateTimeEntry {
  date: string
  startTime?: string
  endTime?: string
}

export function JobPostForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState<DateTimeEntry[]>([{ date: '', startTime: '', endTime: '' }])
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [selectedJobType, setSelectedJobType] = useState<string>('')
  // Contract terms stored as array of term IDs
  const [selectedContractTerms, setSelectedContractTerms] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleJobTypeChange = (jobType: string) => {
    setSelectedJobType(jobType)
    setValue('jobType', jobType as any)
  }

  function addDate() {
    setDates([...dates, { date: '', startTime: '', endTime: '' }])
  }

  function removeDate(index: number) {
    setDates(dates.filter((_, i) => i !== index))
  }

  function updateDate(index: number, value: string) {
    const newDates = [...dates]
    newDates[index] = { ...newDates[index], date: value }
    setDates(newDates)
  }

  function updateStartTime(index: number, value: string) {
    const newDates = [...dates]
    newDates[index] = { ...newDates[index], startTime: value }
    setDates(newDates)
  }

  function updateEndTime(index: number, value: string) {
    const newDates = [...dates]
    newDates[index] = { ...newDates[index], endTime: value }
    setDates(newDates)
  }

  async function onSubmit(data: FormData) {
    // Filter and validate dates
    const validDateEntries = dates.filter((d) => {
      if (!d.date.trim()) return false
      
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(d.date)) {
        toast.error('Invalid date format. Please use the date picker.')
        return false
      }
      
      // Validate that date is not in the past
      const selectedDate = new Date(d.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        toast.error('Event dates cannot be in the past')
        return false
      }
      
      // Validate time format if provided (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (d.startTime && !timeRegex.test(d.startTime)) {
        toast.error('Invalid start time format')
        return false
      }
      if (d.endTime && !timeRegex.test(d.endTime)) {
        toast.error('Invalid end time format')
        return false
      }
      
      // Validate that end time is after start time
      if (d.startTime && d.endTime && d.startTime >= d.endTime) {
        toast.error('End time must be after start time')
        return false
      }
      
      return true
    })
    
    if (validDateEntries.length === 0) {
      toast.error('Please add at least one valid date')
      return
    }

    if (!locationData || !locationData.formatted) {
      setLocationError('Please select a location from the suggestions')
      toast.error('Please select a valid location')
      return
    }

    setLoading(true)
    try {
      const result = await createJobPost({
        title: data.title,
        description: data.description,
        budget: data.budget,
        jobTypes: [data.jobType], // Convert single job type to array for database
        contractAdditionalDetails: data.contractAdditionalDetails,
        location: locationData.formatted,
        locationFormatted: locationData.formatted,
        locationCity: locationData.city,
        locationState: locationData.state,
        locationCountry: locationData.country,
        locationLatitude: locationData.latitude?.toString(),
        locationLongitude: locationData.longitude?.toString(),
        locationPlaceId: locationData.placeId,
        dates: validDateEntries,
        contractTerms: selectedContractTerms,
      })

      if (result.success) {
        toast.success('Job posted successfully!')
        router.push('/company')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to post job')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Job Title */}
      <div className="space-y-3">
        <Label htmlFor="title" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-white" />
          </span>
          Job Title
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="e.g., Wedding Photography & Videography"
          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors rounded-xl text-base"
        />
        {errors.title && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.title.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Label htmlFor="description" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </span>
          Description
          <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe the job requirements..."
          rows={3}
          className="border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors rounded-xl text-base"
        />
        {errors.description && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.description.message}
          </p>
        )}
      </div>

      {/* Location & Budget */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </span>
            Location
            <span className="text-red-500">*</span>
          </Label>
          <LocationAutocomplete
            value={locationData?.formatted || ''}
            onChange={(data) => {
              setLocationData(data)
              setLocationError('')
            }}
            placeholder="Search for venue or city..."
            className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors rounded-xl text-base"
            error={locationError}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="budget" className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-linear-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4 text-white" />
            </span>
            Budget
            <span className="text-sm font-normal text-gray-500">(Optional)</span>
          </Label>
          <Input
            id="budget"
            type="number"
            {...register('budget')}
            placeholder="50000"
            className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors rounded-xl text-base"
          />
          {errors.budget && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.budget.message}
            </p>
          )}
        </div>
      </div>

      {/* Job Type - Single Select */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-white" />
          </span>
          Select Job Type
          <span className="text-red-500">*</span>
        </Label>
        
        <Select
          value={selectedJobType}
          onValueChange={handleJobTypeChange}
        >
          <SelectTrigger className="w-full !h-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-colors rounded-xl text-base px-4">
            <SelectValue placeholder="Select a job type..." />
          </SelectTrigger>
          <SelectContent className="w-full">
            {JOB_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="py-3">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {errors.jobType && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.jobType.message}
          </p>
        )}
      </div>

      {/* Event Dates & Times */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </span>
          Event Dates & Times
          <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-3">
          {dates.map((entry, index) => (
            <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Event {index + 1}</span>
                {dates.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDate(index)}
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              
              {/* Date Input - Full Width */}
              <div className="space-y-2">
                <Label htmlFor={`date-${index}`} className="text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`date-${index}`}
                  value={entry.date}
                  onChange={(e) => updateDate(index, e.target.value)}
                  placeholder="Select date"
                  type="date"
                  className="h-12 border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors rounded-xl text-base"
                />
              </div>

              {/* Time Inputs - Grid Layout (responsive) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`start-time-${index}`} className="text-sm font-medium text-gray-700">
                    Start Time <span className="text-xs text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id={`start-time-${index}`}
                    value={entry.startTime || ''}
                    onChange={(e) => updateStartTime(index, e.target.value)}
                    placeholder="Start time"
                    type="time"
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors rounded-xl text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`end-time-${index}`} className="text-sm font-medium text-gray-700">
                    End Time <span className="text-xs text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id={`end-time-${index}`}
                    value={entry.endTime || ''}
                    onChange={(e) => updateEndTime(index, e.target.value)}
                    placeholder="End time"
                    type="time"
                    className="h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors rounded-xl text-base"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            onClick={addDate} 
            className="w-full h-12 border-2 border-dashed border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-700 font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Date
          </Button>
        </div>
      </div>

      {/* Contract Terms */}
      <div className="space-y-4">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4 text-white" />
          </span>
          Default Contract Terms
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <div className="bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 space-y-3">
          {CONTRACT_TERMS.map((term) => (
            <div key={term.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50/50 transition-colors">
              <Checkbox
                id={term.id}
                checked={selectedContractTerms.includes(term.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedContractTerms([...selectedContractTerms, term.id])
                  } else {
                    setSelectedContractTerms(selectedContractTerms.filter(id => id !== term.id))
                  }
                }}
                className="w-5 h-5"
              />
              <Label htmlFor={term.id} className="font-medium text-gray-900 cursor-pointer flex-1">
                {term.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Contract Details */}
      <div className="space-y-3">
        <Label htmlFor="contractAdditionalDetails" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </span>
          Additional Contract Details
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <Textarea
          id="contractAdditionalDetails"
          {...register('contractAdditionalDetails')}
          placeholder="Any additional terms or conditions..."
          rows={3}
          className="border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-colors rounded-xl text-base"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2" 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
              Posting Job...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Post Job
            </>
          )}
        </Button>
      </div>
    </form>
  )
}



