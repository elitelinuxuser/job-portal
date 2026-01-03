'use client'

import { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateCompanyProfile } from '@/lib/actions/company'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { Upload, X, Image as ImageIcon, Building2, User, Calendar, Save } from 'lucide-react'
import { LocationAutocomplete, LocationData } from '@/components/shared/location-autocomplete'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPersonName: z.string().min(2, 'Contact person name is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
  startedIn: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CompanyProfile {
  id: string
  userId: string
  companyName: string
  contactPersonName: string
  whatsappNumber: string
  location: string
  startedIn: number | null
  logoUrl: string | null
}

export function EditCompanyProfileForm({ profile }: { profile: CompanyProfile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(profile.logoUrl)
  const [locationData, setLocationData] = useState<LocationData | null>({
    formatted: profile.location,
    city: profile.location,
  } as LocationData)
  const [locationError, setLocationError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: profile.companyName,
      contactPersonName: profile.contactPersonName,
      whatsappNumber: profile.whatsappNumber,
      startedIn: profile.startedIn?.toString() || '',
    },
  })

  function buildBlobPath(kind: 'logo', file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const unique = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    return `company/${kind}/${unique}-${safeName}`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
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
    if (!locationData || !locationData.formatted) {
      setLocationError('Please select a location from the suggestions')
      toast.error('Please select a valid location')
      return
    }

    setLoading(true)
    try {
      let logoUrl: string | undefined = profile.logoUrl || undefined

      if (logoFile) {
        const blob = await upload(buildBlobPath('logo', logoFile), logoFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        logoUrl = blob.url
      }

      const result = await updateCompanyProfile({
        companyName: data.companyName,
        contactPersonName: data.contactPersonName,
        whatsappNumber: data.whatsappNumber,
        location: locationData.city || locationData.formatted,
        startedIn: data.startedIn ? parseInt(data.startedIn) : undefined,
        logoUrl,
      })

      if (result.success) {
        toast.success('Profile updated successfully!')
        router.push('/company')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Logo */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-white" />
          </span>
          Company Logo
        </Label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="relative">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-24 h-24 rounded-lg object-contain border-2 border-blue-100 bg-white"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </label>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="space-y-3">
        <Label htmlFor="companyName" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </span>
          Company Name
        </Label>
        <Input
          id="companyName"
          {...register('companyName')}
          placeholder="Your company name"
          className="h-12 text-base"
        />
        {errors.companyName && (
          <p className="text-red-500 text-sm">{errors.companyName.message}</p>
        )}
      </div>

      {/* Contact Person Name */}
      <div className="space-y-3">
        <Label htmlFor="contactPersonName" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </span>
          Contact Person Name
        </Label>
        <Input
          id="contactPersonName"
          {...register('contactPersonName')}
          placeholder="Your name"
          className="h-12 text-base"
        />
        {errors.contactPersonName && (
          <p className="text-red-500 text-sm">{errors.contactPersonName.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-white" />
          </span>
          Location
        </Label>
        <LocationAutocomplete
          value={profile.location}
          onChange={(data) => {
            setLocationData(data)
            setLocationError('')
          }}
          placeholder="Search for your city..."
          restrictToCities
        />
        {locationError && (
          <p className="text-red-500 text-sm">{locationError}</p>
        )}
      </div>

      {/* WhatsApp Number */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </span>
          WhatsApp Number
        </Label>
        <Controller
          name="whatsappNumber"
          control={control}
          render={({ field }) => (
            <PhoneInput
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.whatsappNumber && (
          <p className="text-red-500 text-sm">{errors.whatsappNumber.message}</p>
        )}
      </div>

      {/* Started In */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </span>
          Started In
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <Controller
          name="startedIn"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 text-lg font-semibold bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
      >
        <Save className="w-5 h-5 mr-2" />
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
