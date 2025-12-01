import { db } from '@/lib/db'
import { freelancerProfiles, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  MapPin, 
  Phone, 
  Camera, 
  Award,
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react'
import Image from 'next/image'

export default async function FreelancerPublicProfile({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params

  // Fetch freelancer profile
  const freelancer = await db.query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, id),
  })

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  })

  if (!freelancer || !user) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <Card className="border-t-4 border-t-blue-600 shadow-xl mb-6">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Photo */}
              <div className="relative">
                {freelancer.photoUrl ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                    <Image
                      src={freelancer.photoUrl}
                      alt={freelancer.name}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-lg">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                {freelancer.verificationStatus === 'verified' && (
                  <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-4 border-white shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{freelancer.name}</h1>
                  <Badge 
                    className={
                      freelancer.verificationStatus === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {freelancer.verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">{freelancer.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">{freelancer.whatsappNumber}</span>
                  </div>
                </div>

                <p className="text-gray-600 mt-3">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment Card */}
        {freelancer.equipmentList && (freelancer.equipmentList as string[]).length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Camera className="w-6 h-6 text-blue-600" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(freelancer.equipmentList as string[]).map((equipment, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="px-4 py-2 text-base bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {equipment}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Card */}
        {freelancer.portfolioLinks && (freelancer.portfolioLinks as string[]).length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="w-6 h-6 text-blue-600" />
                Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {(freelancer.portfolioLinks as string[]).map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <LinkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">Portfolio {index + 1}</p>
                      <p className="text-sm text-gray-600 truncate">{link}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Info Card */}
        <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-white">
              <Phone className="w-8 h-8" />
              <div>
                <p className="text-lg font-semibold">Get in Touch</p>
                <p className="text-blue-100">Contact via WhatsApp: {freelancer.whatsappNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
