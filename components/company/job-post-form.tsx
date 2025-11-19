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
import { Plus, X } from 'lucide-react'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(2, 'Location is required'),
  budget: z.string().min(1, 'Budget is required'),
  jobType: z.string().min(2, 'Job type is required'),
  time: z.string().min(2, 'Time is required'),
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
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="e.g., Wedding Photography & Videography"
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe the job requirements..."
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="City, Venue"
          />
          {errors.location && (
            <p className="text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget (₹) *</Label>
          <Input
            id="budget"
            type="number"
            {...register('budget')}
            placeholder="50000"
          />
          {errors.budget && (
            <p className="text-sm text-red-600">{errors.budget.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobType">Job Type *</Label>
          <Input
            id="jobType"
            {...register('jobType')}
            placeholder="Photography, Videography"
          />
          {errors.jobType && (
            <p className="text-sm text-red-600">{errors.jobType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time *</Label>
          <Input
            id="time"
            {...register('time')}
            placeholder="10 AM - 6 PM"
          />
          {errors.time && (
            <p className="text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Dates *</Label>
        {dates.map((date, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={date}
              onChange={(e) => updateDate(index, e.target.value)}
              placeholder="YYYY-MM-DD"
              type="date"
            />
            {dates.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeDate(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addDate} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Date
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Default Contract Terms</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="contentPosting"
              checked={contractOptions.contentPosting}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, contentPosting: !!checked })
              }
            />
            <Label htmlFor="contentPosting" className="font-normal">
              Content Posting Rights
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="advancePayment"
              checked={contractOptions.advancePayment}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, advancePayment: !!checked })
              }
            />
            <Label htmlFor="advancePayment" className="font-normal">
              Advance Payment
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="paymentAfterShot"
              checked={contractOptions.paymentAfterShot}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, paymentAfterShot: !!checked })
              }
            />
            <Label htmlFor="paymentAfterShot" className="font-normal">
              Payment After Shot
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="contentOwnership"
              checked={contractOptions.contentOwnership}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, contentOwnership: !!checked })
              }
            />
            <Label htmlFor="contentOwnership" className="font-normal">
              Content Ownership
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sdCard"
              checked={contractOptions.sdCard}
              onCheckedChange={(checked) =>
                setContractOptions({ ...contractOptions, sdCard: !!checked })
              }
            />
            <Label htmlFor="sdCard" className="font-normal">
              SD Card Handover
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contractAdditionalDetails">Additional Contract Details</Label>
        <Textarea
          id="contractAdditionalDetails"
          {...register('contractAdditionalDetails')}
          placeholder="Any additional terms or conditions..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Posting Job...' : 'Post Job'}
      </Button>
    </form>
  )
}



