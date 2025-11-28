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
import { Plus, X, Briefcase, FileText, MapPin, IndianRupee, Camera, Calendar, FileCheck, Sparkles, ChevronDown, Check } from 'lucide-react'
import { LocationAutocomplete, LocationData } from '@/components/shared/location-autocomplete'
import { JOB_TYPE_OPTIONS, JOB_TYPES, getJobTypeLabel } from '@/lib/constants/job-types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z.string().optional(),
  jobTypes: z.array(z.enum([
    JOB_TYPES.CANDID_PHOTOGRAPHER,
    JOB_TYPES.CINEMATOGRAPHER,
    JOB_TYPES.TRADITIONAL_PHOTOGRAPHER,
    JOB_TYPES.TRADITIONAL_VIDEOGRAPHER,
    JOB_TYPES.PHOTO_EDITOR,
    JOB_TYPES.VIDEO_EDITOR,
    JOB_TYPES.DRONE,
  ])).min(1, 'Please select at least one job type'),
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
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [contractOptions, setContractOptions] = useState({
    contentPosting: false,
    advancePayment: false,
    paymentAfterShot: false,
    contentOwnership: false,
    sdCard: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const toggleJobType = (jobType: string) => {
    const newTypes = selectedJobTypes.includes(jobType)
      ? selectedJobTypes.filter(t => t !== jobType)
      : [...selectedJobTypes, jobType]
    setSelectedJobTypes(newTypes)
    setValue('jobTypes', newTypes as any)
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
        ...data,
        location: locationData.formatted,
        locationFormatted: locationData.formatted,
        locationCity: locationData.city,
        locationState: locationData.state,
        locationCountry: locationData.country,
        locationLatitude: locationData.latitude?.toString(),
        locationLongitude: locationData.longitude?.toString(),
        locationPlaceId: locationData.placeId,
        dates: validDateEntries,
        contractContentPosting: contractOptions.contentPosting,
        contractAdvancePayment: contractOptions.advancePayment,
        contractPaymentAfterShot: contractOptions.paymentAfterShot,
        contractContentOwnership: contractOptions.contentOwnership,
        contractSdCard: contractOptions.sdCard,
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

      {/* Job Types - Multi Select */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-white" />
          </span>
          Select Job Types
          <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">Select all types that apply to this job</p>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className="w-full justify-between h-auto min-h-[48px] px-4 py-3 text-left font-normal border-2 hover:border-pink-300"
            >
              <span className="truncate">
                {selectedJobTypes.length === 0 ? (
                  <span className="text-gray-500">Select job types...</span>
                ) : selectedJobTypes.length === 1 ? (
                  getJobTypeLabel(selectedJobTypes[0] as typeof JOB_TYPES[keyof typeof JOB_TYPES])
                ) : (
                  <span className="font-medium">{selectedJobTypes.length} types selected</span>
                )}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[400px] p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
            <div className="max-h-[300px] overflow-y-auto">
              {JOB_TYPE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-0",
                    selectedJobTypes.includes(option.value) && "bg-pink-50"
                  )}
                  onClick={() => toggleJobType(option.value)}
                >
                  <Checkbox
                    checked={selectedJobTypes.includes(option.value)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm flex-1 font-medium">{option.label}</span>
                  {selectedJobTypes.includes(option.value) && (
                    <Check className="h-4 w-4 text-pink-600" />
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {selectedJobTypes.length > 0 && (
          <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
            <Check className="h-3 w-3 text-green-600" />
            {selectedJobTypes.length} type{selectedJobTypes.length !== 1 ? 's' : ''} selected
          </p>
        )}
        
        {errors.jobTypes && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.jobTypes.message}
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
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50/50 transition-colors">
            <Checkbox
              id="contentPosting"
              checked={contractOptions.contentPosting}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, contentPosting: !!checked })
              }
              className="w-5 h-5"
            />
            <Label htmlFor="contentPosting" className="font-medium text-gray-900 cursor-pointer flex-1">
              Content Posting Rights
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50/50 transition-colors">
            <Checkbox
              id="advancePayment"
              checked={contractOptions.advancePayment}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, advancePayment: !!checked })
              }
              className="w-5 h-5"
            />
            <Label htmlFor="advancePayment" className="font-medium text-gray-900 cursor-pointer flex-1">
              Advance Payment
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50/50 transition-colors">
            <Checkbox
              id="paymentAfterShot"
              checked={contractOptions.paymentAfterShot}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, paymentAfterShot: !!checked })
              }
              className="w-5 h-5"
            />
            <Label htmlFor="paymentAfterShot" className="font-medium text-gray-900 cursor-pointer flex-1">
              Payment After Shot
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50/50 transition-colors">
            <Checkbox
              id="contentOwnership"
              checked={contractOptions.contentOwnership}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, contentOwnership: !!checked })
              }
              className="w-5 h-5"
            />
            <Label htmlFor="contentOwnership" className="font-medium text-gray-900 cursor-pointer flex-1">
              Content Ownership
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200 hover:bg-blue-50/50 transition-colors">
            <Checkbox
              id="sdCard"
              checked={contractOptions.sdCard}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, sdCard: !!checked })
              }
              className="w-5 h-5"
            />
            <Label htmlFor="sdCard" className="font-medium text-gray-900 cursor-pointer flex-1">
              SD Card Handover
            </Label>
          </div>
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



