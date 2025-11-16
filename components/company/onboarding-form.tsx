'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createCompanyProfile } from '@/lib/actions/company'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPersonName: z.string().min(2, 'Contact person name is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
  location: z.string().min(2, 'Location is required'),
  startedIn: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function OnboardingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      let logoUrl: string | undefined

      // Upload logo if provided
      if (logoFile) {
        const blob = await upload(logoFile.name, logoFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        logoUrl = blob.url
      }

      const result = await createCompanyProfile({
        ...data,
        startedIn: data.startedIn ? parseInt(data.startedIn) : undefined,
        logoUrl,
      })

      if (result.success) {
        toast.success('Profile created successfully!')
        router.push('/company')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to create profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          {...register('companyName')}
          placeholder="Enter company name"
        />
        {errors.companyName && (
          <p className="text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPersonName">Contact Person Name *</Label>
        <Input
          id="contactPersonName"
          {...register('contactPersonName')}
          placeholder="Enter contact person name"
        />
        {errors.contactPersonName && (
          <p className="text-sm text-red-600">{errors.contactPersonName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
        <Input
          id="whatsappNumber"
          {...register('whatsappNumber')}
          placeholder="+91 XXXXXXXXXX"
        />
        {errors.whatsappNumber && (
          <p className="text-sm text-red-600">{errors.whatsappNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location (Based in) *</Label>
        <Input
          id="location"
          {...register('location')}
          placeholder="City, State"
        />
        {errors.location && (
          <p className="text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startedIn">Started In (Year)</Label>
        <Input
          id="startedIn"
          type="number"
          {...register('startedIn')}
          placeholder="2020"
        />
        {errors.startedIn && (
          <p className="text-sm text-red-600">{errors.startedIn.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Company Logo</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
        />
        <p className="text-sm text-gray-500">Upload your company logo (optional)</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Profile...' : 'Complete Setup'}
      </Button>
    </form>
  )
}

