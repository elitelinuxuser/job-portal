import { db } from '@/lib/db'
import { companyProfiles, freelancerProfiles, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApprovalActions } from '@/components/admin/approval-actions'
import { Clock, Building, User as UserIcon } from 'lucide-react'

export default async function ApprovalsPage() {
  // Get pending company profiles
  const pendingCompanies = await db
    .select({
      profile: companyProfiles,
      user: users,
    })
    .from(companyProfiles)
    .innerJoin(users, eq(users.id, companyProfiles.userId))
    .where(eq(companyProfiles.verificationStatus, 'pending'))

  // Get pending freelancer profiles
  const pendingFreelancers = await db
    .select({
      profile: freelancerProfiles,
      user: users,
    })
    .from(freelancerProfiles)
    .innerJoin(users, eq(users.id, freelancerProfiles.userId))
    .where(eq(freelancerProfiles.verificationStatus, 'pending'))

  // Get verified profiles
  const verifiedCompanies = await db
    .select({
      profile: companyProfiles,
      user: users,
    })
    .from(companyProfiles)
    .innerJoin(users, eq(users.id, companyProfiles.userId))
    .where(eq(companyProfiles.verificationStatus, 'verified'))

  const verifiedFreelancers = await db
    .select({
      profile: freelancerProfiles,
      user: users,
    })
    .from(freelancerProfiles)
    .innerJoin(users, eq(users.id, freelancerProfiles.userId))
    .where(eq(freelancerProfiles.verificationStatus, 'verified'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve user profiles</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Companies</p>
                <p className="text-3xl font-bold">{pendingCompanies.length}</p>
              </div>
              <Building className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Freelancers</p>
                <p className="text-3xl font-bold">{pendingFreelancers.length}</p>
              </div>
              <UserIcon className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-3xl font-bold">{pendingCompanies.length + pendingFreelancers.length}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">
            Companies ({pendingCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="freelancers">
            Freelancers ({pendingFreelancers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          {pendingCompanies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No pending company approvals
              </CardContent>
            </Card>
          ) : (
            pendingCompanies.map(({ profile, user }) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{profile.companyName}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Contact Person:</span>
                      <span className="ml-2 font-medium">{profile.contactPersonName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{profile.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">WhatsApp:</span>
                      <span className="ml-2 font-medium">{profile.whatsappNumber}</span>
                    </div>
                    {profile.startedIn && (
                      <div>
                        <span className="text-gray-600">Started In:</span>
                        <span className="ml-2 font-medium">{profile.startedIn}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.logoUrl && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Company Logo:</p>
                        <img
                          src={profile.logoUrl}
                          alt="Company logo"
                          className="h-20 w-20 object-contain border rounded"
                        />
                      </div>
                    )}

                    {profile.proofOfOwnershipUrl && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Proof of Ownership:</p>
                        <a
                          href={profile.proofOfOwnershipUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
                        >
                          View Document
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>

                  <ApprovalActions
                    profileId={profile.id}
                    userId={user.id}
                    userEmail={user.email}
                    profileType="company"
                  />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="freelancers" className="space-y-4">
          {pendingFreelancers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No pending freelancer approvals
              </CardContent>
            </Card>
          ) : (
            pendingFreelancers.map(({ profile, user }) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{profile.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{profile.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">WhatsApp:</span>
                      <span className="ml-2 font-medium">{profile.whatsappNumber}</span>
                    </div>
                  </div>

                  {profile.photoUrl && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Profile Photo:</p>
                      <img
                        src={profile.photoUrl}
                        alt="Profile"
                        className="h-24 w-24 object-cover rounded-full border"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Equipment:</p>
                    <ul className="list-disc list-inside text-sm">
                      {profile.equipmentList.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Portfolio:</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.portfolioLinks.map((link: string, index: number) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {new URL(link).hostname}
                        </a>
                      ))}
                    </div>
                  </div>

                  {profile.idProofUrl && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">ID Proof:</p>
                      <a
                        href={profile.idProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Document
                      </a>
                    </div>
                  )}

                  <ApprovalActions
                    profileId={profile.id}
                    userId={user.id}
                    userEmail={user.email}
                    profileType="freelancer"
                  />
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

