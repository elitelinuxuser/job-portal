import { redirect } from 'next/navigation'
import { getCompanyProfile } from '@/lib/actions/company'
import { EditCompanyProfileForm } from '@/components/company/edit-profile-form'
import { Card } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export default async function CompanyProfilePage() {
  const profile = await getCompanyProfile()

  if (!profile) {
    redirect('/company/onboarding')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Edit Company Profile</h1>
              <p className="text-blue-100 text-sm mt-0.5">
                Update your company information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Card className="p-4 sm:p-6 md:p-8 shadow-xl border-t-4 border-t-blue-600">
          <EditCompanyProfileForm profile={{
            id: profile.id,
            userId: profile.userId,
            companyName: profile.companyName,
            contactPersonName: profile.contactPersonName,
            whatsappNumber: profile.whatsappNumber,
            location: profile.location,
            startedIn: profile.startedIn,
            logoUrl: profile.logoUrl,
          }} />
        </Card>
      </div>
    </div>
  )
}
