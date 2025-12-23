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
import { createCompanyProfile } from '@/lib/actions/company'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { Upload, X, Image as ImageIcon, Building2, User, MapPin, Calendar, FileText, Sparkles } from 'lucide-react'
import { LocationAutocomplete, LocationData } from '@/components/shared/location-autocomplete'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPersonName: z.string().min(2, 'Contact person name is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
  startedIn: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function OnboardingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const proofInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function buildBlobPath(kind: 'logo' | 'proof', file: File) {
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
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveProof = () => {
    setProofFile(null)
    if (proofInputRef.current) {
      proofInputRef.current.value = ''
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
      let logoUrl: string | undefined
      let proofOfOwnershipUrl: string | undefined

      // Upload logo if provided
      if (logoFile) {
        const blob = await upload(buildBlobPath('logo', logoFile), logoFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        logoUrl = blob.url
      }

      // Upload proof of ownership if provided
      if (proofFile) {
        const blob = await upload(buildBlobPath('proof', proofFile), proofFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        proofOfOwnershipUrl = blob.url
      }

      const result = await createCompanyProfile({
        ...data,
        location: locationData.city || locationData.formatted,
        startedIn: data.startedIn ? parseInt(data.startedIn) : undefined,
        logoUrl,
        proofOfOwnershipUrl,
      })

      if (result.success) {
        toast.success('Profile submitted for review!')
        router.push('/company/pending')
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
      {/* Company Name */}
      <div className="space-y-3">
        <Label htmlFor="companyName" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </span>
          Company Name
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          {...register('companyName')}
          placeholder="Enter your company name"
          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors rounded-xl text-base"
        />
        {errors.companyName && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.companyName.message}
          </p>
        )}
      </div>

      {/* Contact Person Name */}
      <div className="space-y-3">
        <Label htmlFor="contactPersonName" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </span>
          Contact Person Name
          <span className="text-red-500">*</span>
        </Label>
        <Input
          id="contactPersonName"
          {...register('contactPersonName')}
          placeholder="Your full name"
          className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors rounded-xl text-base"
        />
        {errors.contactPersonName && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.contactPersonName.message}
          </p>
        )}
      </div>

      {/* WhatsApp Number */}
      <div className="space-y-3">
        <Label htmlFor="whatsappNumber" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-lg">📱</span>
          </span>
          WhatsApp Number
          <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="whatsappNumber"
          control={control}
          render={({ field }) => (
            <PhoneInput
              id="whatsappNumber"
              value={field.value}
              onValueChange={field.onChange}
              className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors rounded-xl text-base"
            />
          )}
        />
        {errors.whatsappNumber && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.whatsappNumber.message}
          </p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-white" />
          </span>
          Location (Based in)
          <span className="text-red-500">*</span>
        </Label>
        <LocationAutocomplete
          value={locationData?.formatted || ''}
          onChange={(data) => {
            setLocationData(data)
            setLocationError('')
          }}
          placeholder="Search for city or location..."
          className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors rounded-xl text-base"
          error={locationError}
        />
      </div>

      {/* Started In */}
      <div className="space-y-3">
        <Label htmlFor="startedIn" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </span>
          Started In (Year)
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <Controller
          name="startedIn"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full !h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors rounded-xl text-base !px-4 !py-0">
                <SelectValue placeholder="Select year..." />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.startedIn && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {errors.startedIn.message}
          </p>
        )}
      </div>

      {/* Company Logo */}
      <div className="space-y-3">
        <Label htmlFor="logo" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4 text-white" />
          </span>
          Company Logo
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        
        {!logoPreview ? (
          <div className="flex flex-col gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:from-blue-100 hover:to-cyan-100 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Click to upload company logo
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    PNG, JPG, GIF up to 10MB
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
          <div className="relative border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 bg-white rounded-xl overflow-hidden border-2 border-blue-200 shadow-sm">
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
                <p className="text-base font-semibold text-gray-900 truncate">
                  {logoFile?.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {logoFile && (logoFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="shrink-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Proof of Ownership */}
      <div className="space-y-3">
        <Label htmlFor="proof" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </span>
          Proof of Ownership
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          💡 <span>Business registration, GST certificate, or company ownership proof</span>
        </p>
        
        {!proofFile ? (
          <div className="flex flex-col gap-2">
            <div
              onClick={() => proofInputRef.current?.click()}
              className="border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:from-amber-100 hover:to-orange-100 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Click to upload proof document
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <Input
              ref={proofInputRef}
              id="proof"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleProofChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 bg-white rounded-xl overflow-hidden border-2 border-amber-200 flex items-center justify-center shadow-sm">
                {proofFile.type.startsWith('image/') ? (
                  <ImageIcon className="h-8 w-8 text-amber-600" />
                ) : (
                  <div className="text-red-600 font-bold text-lg">PDF</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {proofFile.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {(proofFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveProof}
                className="shrink-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
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
              Creating Your Profile...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Complete Setup
            </>
          )}
        </Button>
        <p className="text-center text-sm text-gray-500 mt-3">
          Your profile will be reviewed by our admin team
        </p>
      </div>
    </form>
  )
}

