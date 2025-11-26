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
import { Plus, X, Briefcase, FileText, MapPin, IndianRupee, Camera, Clock, Calendar, FileCheck, Sparkles } from 'lucide-react'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(2, 'Location is required'),
  budget: z.string().optional(),
  jobType: z.string().min(2, 'Job type is required'),
  time: z.string().optional(),
  contractAdditionalDetails: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function JobPostForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dates, setDates] = useState<string[]>([''])
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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function addDate() {
    setDates([...dates, ''])
  }

  function removeDate(index: number) {
    setDates(dates.filter((_, i) => i !== index))
  }

  function updateDate(index: number, value: string) {
    const newDates = [...dates]
    newDates[index] = value
    setDates(newDates)
  }

  async function onSubmit(data: FormData) {
    const validDates = dates.filter((d) => d.trim() !== '')
    
    if (validDates.length === 0) {
      toast.error('Please add at least one date')
      return
    }

    setLoading(true)
    try {
      const result = await createJobPost({
        ...data,
        dates: validDates,
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
          <Label htmlFor="location" className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </span>
            Location
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="City, Venue"
            className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors rounded-xl text-base"
          />
          {errors.location && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.location.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="budget" className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
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

      {/* Job Type & Time */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="jobType" className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4 text-white" />
            </span>
            Job Type
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="jobType"
            {...register('jobType')}
            placeholder="Photography, Videography"
            className="h-12 border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-colors rounded-xl text-base"
          />
          {errors.jobType && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.jobType.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="time" className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </span>
            Time
            <span className="text-sm font-normal text-gray-500">(Optional)</span>
          </Label>
          <Input
            id="time"
            {...register('time')}
            placeholder="10 AM - 6 PM"
            className="h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors rounded-xl text-base"
          />
          {errors.time && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.time.message}
            </p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </span>
          Event Dates
          <span className="text-red-500">*</span>
        </Label>
        <div className="space-y-3">
          {dates.map((date, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={date}
                onChange={(e) => updateDate(index, e.target.value)}
                placeholder="YYYY-MM-DD"
                type="date"
                className="h-12 border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors rounded-xl text-base"
              />
              {dates.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeDate(index)}
                  className="h-12 w-12 border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
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



