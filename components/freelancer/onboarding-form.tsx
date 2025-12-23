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
import { createFreelancerProfile } from '@/lib/actions/freelancer'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { 
  Plus, 
  X, 
  User, 
  Camera, 
  Briefcase, 
  Link as LinkIcon, 
  FileText,
  Upload as UploadIcon,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { LocationAutocomplete, LocationData } from '@/components/shared/location-autocomplete'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  location: z.string().min(2, 'Location is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
  idProof: z.any().refine((file) => file !== null, 'ID proof is required for verification'),
})

type FormData = z.infer<typeof schema>

export function FreelancerOnboardingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [idProofFile, setIdProofFile] = useState<File | null>(null)
  const [equipment, setEquipment] = useState<string[]>([''])
  const [portfolios, setPortfolios] = useState<string[]>(['', '', ''])
  const [portfolioErrors, setPortfolioErrors] = useState<string[]>(['', '', ''])
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)
  const idProofInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange', // Validate on change
  })

  function buildBlobPath(kind: 'photo' | 'id-proof', file: File) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const unique = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    return `freelancer/${kind}/${unique}-${safeName}`
  }

  function addEquipment() {
    setEquipment([...equipment, ''])
  }

  function removeEquipment(index: number) {
    setEquipment(equipment.filter((_, i) => i !== index))
  }

  function updateEquipment(index: number, value: string) {
    const newEquipment = [...equipment]
    newEquipment[index] = value
    setEquipment(newEquipment)
  }

  function normalizeUrl(url: string): string {
    const trimmed = url.trim()
    if (!trimmed) return ''
    
    // Remove any existing protocol and www
    const cleanUrl = trimmed.replace(/^(https?:\/\/)?(www\.)?/, '')
    
    // Add https:// prefix for consistent storage
    return `https://${cleanUrl}`
  }

  function updatePortfolio(index: number, value: string) {
    const newPortfolios = [...portfolios]
    newPortfolios[index] = value
    setPortfolios(newPortfolios)

    // Validate URL format if not empty
    const newErrors = [...portfolioErrors]
    if (value.trim() !== '') {
      // Very lenient URL pattern - accepts domains with or without protocol/www
      // Matches: domain.com, www.domain.com, https://domain.com, sub.domain.com, etc.
      const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/[^\s]*)?$/
      if (!urlPattern.test(value.trim())) {
        newErrors[index] = 'Please enter a valid domain (e.g., example.com)'
      } else {
        newErrors[index] = ''
      }
    } else {
      newErrors[index] = ''
    }
    setPortfolioErrors(newErrors)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleRemovePhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  function handleIdProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setIdProofFile(file)
      setValue('idProof', file, { shouldValidate: true })
    }
  }

  async function onSubmit(data: FormData) {
    // Validate location is selected
    if (!locationData) {
      setLocationError('Please select a city from the dropdown')
      toast.error('Please select a valid city')
      return
    }

    // Validate ID proof is uploaded
    if (!idProofFile) {
      toast.error('ID proof is required for verification')
      return
    }

    // Check for portfolio URL errors
    const hasPortfolioErrors = portfolioErrors.some(error => error !== '')
    if (hasPortfolioErrors) {
      toast.error('Please fix portfolio URL errors before submitting')
      return
    }

    setLoading(true)
    try {
      let photoUrl: string | undefined

      // Upload photo if provided
      if (photoFile) {
        const blob = await upload(buildBlobPath('photo', photoFile), photoFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        photoUrl = blob.url
      }

      // Upload ID proof
      const idProofBlob = await upload(buildBlobPath('id-proof', idProofFile), idProofFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })
      const idProofUrl = idProofBlob.url

      const validEquipment = equipment.filter((e) => e.trim() !== '')
      
      // Normalize portfolio URLs - ensures consistent https:// format and removes www
      const validPortfolios = portfolios
        .filter((p) => p.trim() !== '')
        .map(normalizeUrl)

      const result = await createFreelancerProfile({
        ...data,
        photoUrl,
        idProofUrl,
        equipmentList: validEquipment,
        portfolioLinks: validPortfolios,
      })

      if (result.success) {
        toast.success('Profile submitted for review!')
        router.push('/freelancer/pending')
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
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
      {/* Profile Photo Section - First Field */}
      <div className="mb-6 flex flex-col items-center">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Profile Photo</h2>
          <p className="text-sm text-gray-600">Upload your profile picture (optional)</p>
        </div>

        {!photoPreview ? (
          <div
            onClick={() => photoInputRef.current?.click()}
            className="w-32 h-32 rounded-full border-4 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:from-blue-100 hover:to-cyan-100 transition-all"
          >
            <Camera className="w-10 h-10 text-blue-600 mb-2" />
            <span className="text-xs text-gray-600 font-medium">Upload Photo</span>
          </div>
        ) : (
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 bg-white shadow-lg">
              <img
                src={photoPreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      <Separator className="my-6" />

      {/* Basic Information Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
            <p className="text-sm text-gray-600">Tell us about yourself</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-900">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter your full name"
                className="pl-10 h-11 placeholder:text-sm bg-white border-gray-300"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-900">
                Location <span className="text-red-500">*</span>
              </Label>
              <LocationAutocomplete
                value={locationData?.formatted || ''}
                onChange={(data) => {
                  setLocationData(data)
                  setLocationError('')
                  setValue('location', data.city || data.formatted, { shouldValidate: true })
                }}
                placeholder="Search for your city..."
                className="h-11 placeholder:text-sm bg-white border-gray-300"
                error={locationError}
                restrictToCities={true}
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-sm font-medium text-gray-900">
                WhatsApp Number <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="whatsappNumber"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    id="whatsappNumber"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="h-11 placeholder:text-sm bg-white border-gray-300"
                  />
                )}
              />
              {errors.whatsappNumber && (
                <p className="text-sm text-red-600">{errors.whatsappNumber.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Equipment Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Equipment</h2>
            <p className="text-sm text-gray-600">List your photography/videography gear</p>
          </div>
        </div>

        <div className="space-y-3">
          {equipment.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateEquipment(index, e.target.value)}
                placeholder="e.g., Canon EOS R5, DJI Mavic Pro"
                className="h-11 placeholder:text-sm bg-white border-gray-300"
              />
              {equipment.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeEquipment(index)}
                  className="h-11 w-11 shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            onClick={addEquipment} 
            className="w-full h-11 border-dashed border-2 hover:bg-purple-50 hover:border-purple-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Portfolio Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0">
            <LinkIcon className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Portfolio</h2>
            <p className="text-sm text-gray-600">Share your best work (up to 3 links)</p>
          </div>
        </div>

        <div className="space-y-3">
          {portfolios.map((link, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`portfolio-${index}`} className="text-sm font-medium text-gray-900">
                Portfolio Link {index + 1}
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <Input
                  id={`portfolio-${index}`}
                  value={link}
                  onChange={(e) => updatePortfolio(index, e.target.value)}
                  placeholder="example.com or www.example.com"
                  type="text"
                  className="pl-10 h-11 placeholder:text-sm bg-white border-gray-300"
                />
              </div>
              {portfolioErrors[index] && (
                <p className="text-sm text-red-600">{portfolioErrors[index]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Verification Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Verification</h2>
            <p className="text-sm text-gray-600">Upload your ID for account verification</p>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="idProof" className="text-sm font-medium text-gray-900 flex items-center gap-2">
            ID Proof (Aadhaar or Indian ID)
            <span className="text-red-500">*</span>
          </Label>
          
          {!idProofFile ? (
            <div className="flex flex-col gap-2">
              <div
                onClick={() => idProofInputRef.current?.click()}
                className="border-2 border-dashed border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 hover:from-green-100 hover:to-emerald-100 transition-all"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                    <UploadIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Click to upload ID proof
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      PDF, PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              </div>
              <Input
                ref={idProofInputRef}
                id="idProof"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleIdProofChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 bg-white rounded-xl overflow-hidden border-2 border-green-200 flex items-center justify-center shadow-sm">
                  {idProofFile.type.startsWith('image/') ? (
                    <ImageIcon className="h-8 w-8 text-green-600" />
                  ) : (
                    <div className="text-red-600 font-bold text-lg">PDF</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 truncate">
                    {idProofFile.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {(idProofFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIdProofFile(null)
                    setValue('idProof', null, { shouldValidate: true })
                  }}
                  className="shrink-0 hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
          {errors.idProof && (
            <p className="text-sm text-red-600">{errors.idProof.message as string}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <div className="shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Profile Review</h3>
            <p className="text-sm text-blue-700">
              Your profile will be reviewed by our team within 24-48 hours. You&apos;ll receive a notification once approved.
            </p>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Creating Profile...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Complete Setup
          </>
        )}
      </Button>
    </form>
  )
}



