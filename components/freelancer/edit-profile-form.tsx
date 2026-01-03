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
import { updateFreelancerProfile } from '@/lib/actions/freelancer'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { 
  Plus, 
  X, 
  User, 
  Camera, 
  Briefcase, 
  Link as LinkIcon, 
  Upload as UploadIcon,
  Image as ImageIcon,
  Save
} from 'lucide-react'
import { LocationAutocomplete, LocationData } from '@/components/shared/location-autocomplete'

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  location: z.string().min(2, 'Location is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
})

type FormData = z.infer<typeof schema>

interface FreelancerProfile {
  id: string
  userId: string
  name: string
  location: string
  photoUrl: string | null
  whatsappNumber: string
  equipmentList: string[] | null
  portfolioLinks: string[] | null
}

export function EditProfileForm({ profile }: { profile: FreelancerProfile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photoUrl)
  const [equipment, setEquipment] = useState<string[]>(
    profile.equipmentList && profile.equipmentList.length > 0 
      ? profile.equipmentList 
      : ['']
  )
  const [portfolios, setPortfolios] = useState<string[]>(
    profile.portfolioLinks && profile.portfolioLinks.length > 0 
      ? [...profile.portfolioLinks, '', ''].slice(0, 3)
      : ['', '', '']
  )
  const [portfolioErrors, setPortfolioErrors] = useState<string[]>(['', '', ''])
  const [locationData, setLocationData] = useState<LocationData | null>({
    formatted: profile.location,
    city: profile.location,
  } as LocationData)
  const [locationError, setLocationError] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile.name,
      location: profile.location,
      whatsappNumber: profile.whatsappNumber,
    },
  })

  function buildBlobPath(kind: 'photo', file: File) {
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
    const cleanUrl = trimmed.replace(/^(https?:\/\/)?(www\.)?/, '')
    return `https://${cleanUrl}`
  }

  function updatePortfolio(index: number, value: string) {
    const newPortfolios = [...portfolios]
    newPortfolios[index] = value
    setPortfolios(newPortfolios)

    const newErrors = [...portfolioErrors]
    if (value.trim() !== '') {
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

  async function onSubmit(data: FormData) {
    if (!locationData) {
      setLocationError('Please select a city from the dropdown')
      toast.error('Please select a valid city')
      return
    }

    const hasPortfolioErrors = portfolioErrors.some(error => error !== '')
    if (hasPortfolioErrors) {
      toast.error('Please fix portfolio URL errors before submitting')
      return
    }

    setLoading(true)
    try {
      let photoUrl: string | undefined = profile.photoUrl || undefined

      if (photoFile) {
        const blob = await upload(buildBlobPath('photo', photoFile), photoFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        photoUrl = blob.url
      }

      const validEquipment = equipment.filter((e) => e.trim() !== '')
      const validPortfolios = portfolios
        .filter((p) => p.trim() !== '')
        .map(normalizeUrl)

      const result = await updateFreelancerProfile({
        name: data.name,
        location: locationData.city || locationData.formatted || data.location,
        whatsappNumber: data.whatsappNumber,
        photoUrl,
        equipmentList: validEquipment,
        portfolioLinks: validPortfolios,
      })

      if (result.success) {
        toast.success('Profile updated successfully!')
        router.push('/freelancer')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Photo */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-white" />
          </span>
          Profile Photo
        </Label>
        <div className="flex items-center gap-4">
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors font-medium"
            >
              <UploadIcon className="w-4 h-4" />
              {photoPreview ? 'Change Photo' : 'Upload Photo'}
            </label>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-3">
        <Label htmlFor="name" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </span>
          Full Name
        </Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Your full name"
          className="h-12 text-base"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
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
            <Briefcase className="w-4 h-4 text-white" />
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

      {/* Equipment */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-white" />
          </span>
          Equipment
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <div className="space-y-2">
          {equipment.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateEquipment(index, e.target.value)}
                placeholder="e.g., Canon EOS R5"
                className="h-12"
              />
              {equipment.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeEquipment(index)}
                  className="h-12 w-12 shrink-0"
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
            className="w-full h-12"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Portfolio Links */}
      <div className="space-y-3">
        <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-linear-to-br from-pink-600 to-rose-600 rounded-lg flex items-center justify-center shrink-0">
            <LinkIcon className="w-4 h-4 text-white" />
          </span>
          Portfolio Links
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <div className="space-y-2">
          {portfolios.map((link, index) => (
            <div key={index}>
              <Input
                value={link}
                onChange={(e) => updatePortfolio(index, e.target.value)}
                placeholder="e.g., instagram.com/yourprofile"
                className="h-12"
              />
              {portfolioErrors[index] && (
                <p className="text-red-500 text-sm mt-1">{portfolioErrors[index]}</p>
              )}
            </div>
          ))}
        </div>
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
