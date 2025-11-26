'use client'

import { useState } from 'react'
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
  MapPin, 
  Camera, 
  Briefcase, 
  Link as LinkIcon, 
  FileText,
  Upload,
  CheckCircle2
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  location: z.string().min(2, 'Location is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
})

type FormData = z.infer<typeof schema>

export function FreelancerOnboardingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [idProofFile, setIdProofFile] = useState<File | null>(null)
  const [equipment, setEquipment] = useState<string[]>([''])
  const [portfolios, setPortfolios] = useState<string[]>(['', '', ''])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

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

  function updatePortfolio(index: number, value: string) {
    const newPortfolios = [...portfolios]
    newPortfolios[index] = value
    setPortfolios(newPortfolios)
  }

  async function onSubmit(data: FormData) {
    // Validate ID proof is uploaded
    if (!idProofFile) {
      toast.error('ID proof is required for verification')
      return
    }

    setLoading(true)
    try {
      let photoUrl: string | undefined

      // Upload photo if provided
      if (photoFile) {
        const blob = await upload(photoFile.name, photoFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        photoUrl = blob.url
      }

      // Upload ID proof
      const idProofBlob = await upload(idProofFile.name, idProofFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })
      const idProofUrl = idProofBlob.url

      const validEquipment = equipment.filter((e) => e.trim() !== '')
      
      // Normalize portfolio URLs - add https:// if missing
      const normalizeUrl = (url: string) => {
        const trimmed = url.trim()
        if (!trimmed) return ''
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed
        }
        return `https://${trimmed}`
      }
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
      {/* Basic Information Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            <p className="text-sm text-gray-600">Tell us about yourself</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
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
                className="pl-10 h-11"
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="City, State"
                  className="pl-10 h-11"
                />
              </div>
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-sm font-medium text-gray-700">
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
                  />
                )}
              />
              {errors.whatsappNumber && (
                <p className="text-sm text-red-600">{errors.whatsappNumber.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="text-sm font-medium text-gray-700">
              Profile Photo
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Camera className="w-4 h-4" />
              </div>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="pl-10 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {photoFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>{photoFile.name}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">Upload your profile photo (optional)</p>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Equipment Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Equipment</h2>
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
                className="h-11"
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

      <Separator className="my-8" />

      {/* Portfolio Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
            <p className="text-sm text-gray-600">Share your best work (up to 3 links)</p>
          </div>
        </div>

        <div className="space-y-3">
          {portfolios.map((link, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`portfolio-${index}`} className="text-sm font-medium text-gray-700">
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
                  placeholder="https://your-portfolio-link.com"
                  type="url"
                  className="pl-10 h-11"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Verification Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Verification</h2>
            <p className="text-sm text-gray-600">Upload your ID for account verification</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idProof" className="text-sm font-medium text-gray-700">
            ID Proof (Aadhaar or Indian ID)
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <Upload className="w-4 h-4" />
            </div>
            <Input
              id="idProof"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
              className="pl-10 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>
          {idProofFile && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>{idProofFile.name}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">Upload your ID proof for verification <span className="text-red-500">(required)</span></p>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-8">
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
        className="w-full h-12 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-base shadow-lg"
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



