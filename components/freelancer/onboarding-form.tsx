'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createFreelancerProfile } from '@/lib/actions/freelancer'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { Plus, X } from 'lucide-react'

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
    setLoading(true)
    try {
      let photoUrl: string | undefined
      let idProofUrl: string | undefined

      // Upload photo if provided
      if (photoFile) {
        const blob = await upload(photoFile.name, photoFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        photoUrl = blob.url
      }

      // Upload ID proof if provided
      if (idProofFile) {
        const blob = await upload(idProofFile.name, idProofFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        })
        idProofUrl = blob.url
      }

      const validEquipment = equipment.filter((e) => e.trim() !== '')
      const validPortfolios = portfolios.filter((p) => p.trim() !== '')

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
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
        <Label htmlFor="photo">Profile Photo</Label>
        <Input
          id="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
        />
        <p className="text-sm text-gray-500">Upload your profile photo (optional)</p>
      </div>

      <div className="space-y-2">
        <Label>Equipment List</Label>
        {equipment.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateEquipment(index, e.target.value)}
              placeholder="e.g., Canon EOS R5, DJI Mavic"
            />
            {equipment.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeEquipment(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addEquipment} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Portfolio Links (Up to 3)</Label>
        {portfolios.map((link, index) => (
          <Input
            key={index}
            value={link}
            onChange={(e) => updatePortfolio(index, e.target.value)}
            placeholder="https://portfolio-link.com"
            type="url"
          />
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="idProof">ID Proof (Aadhaar or Indian ID)</Label>
        <Input
          id="idProof"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
        />
        <p className="text-sm text-gray-500">Upload your ID proof for verification (optional)</p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Profile...' : 'Complete Setup'}
      </Button>
    </form>
  )
}



