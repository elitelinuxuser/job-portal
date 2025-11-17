'use client'

import { useState, useRef } from 'react'
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
import { Upload, X, Image as ImageIcon } from 'lucide-react'

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
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
        
        {!logoPreview ? (
          <div className="flex flex-col gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload company logo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB (optional)
                  </p>
                </div>
              </div>
            </div>
            <Input
              ref={fileInputRef}
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {logoFile?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {logoFile && (logoFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Profile...' : 'Complete Setup'}
      </Button>
    </form>
  )
}

