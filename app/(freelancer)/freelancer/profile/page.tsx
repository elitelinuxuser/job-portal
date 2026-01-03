import { redirect } from 'next/navigation'
import { getFreelancerProfile } from '@/lib/actions/freelancer'
import { EditProfileForm } from '@/components/freelancer/edit-profile-form'
import { Card } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'

export default async function FreelancerProfilePage() {
  const profile = await getFreelancerProfile()

  if (!profile) {
    redirect('/freelancer/onboarding')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Edit Your Profile</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Update your information to attract more clients
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Card className="p-4 sm:p-6 md:p-8 shadow-xl border-t-4 border-t-blue-600">
          <EditProfileForm profile={{
            id: profile.id,
            userId: profile.userId,
            name: profile.name,
            location: profile.location,
            photoUrl: profile.photoUrl,
            whatsappNumber: profile.whatsappNumber,
            equipmentList: profile.equipmentList as string[] | null,
            portfolioLinks: profile.portfolioLinks as string[] | null,
          }} />
        </Card>
      </div>
    </div>
  )
}
