import { db } from '@/lib/db'
import { companyProfiles, freelancerProfiles, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApprovalActions } from '@/components/admin/approval-actions'
import { Clock, Building, User as UserIcon, MapPin, Phone, Calendar, Image as ImageIcon, FileText, Link as LinkIcon, Shield, CheckCircle, XCircle } from 'lucide-react'

// Reusable component for rendering company profile cards
function CompanyProfileCard({ profile, user, showActions = false }: { profile: any, user: any, showActions?: boolean }) {
  return (
    <Card key={profile.id} className="overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.companyName}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
              </div>
            </div>
          </div>
          <Badge className={
            profile.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
            profile.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-300' :
            'bg-red-100 text-red-800 border-red-300'
          }>
            {profile.verificationStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
            {profile.verificationStatus === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
            {profile.verificationStatus === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
            {profile.verificationStatus.charAt(0).toUpperCase() + profile.verificationStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Company Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Contact Person</p>
              <p className="text-sm font-medium text-gray-900">{profile.contactPersonName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location
              </p>
              <p className="text-sm font-medium text-gray-900">{profile.location}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                WhatsApp Number
              </p>
              <p className="text-sm font-medium text-gray-900">{profile.whatsappNumber}</p>
            </div>
            {profile.startedIn && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Started In
                </p>
                <p className="text-sm font-medium text-gray-900">{profile.startedIn}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents & Media */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents & Media
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {profile.logoUrl ? (
              <div className="border rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Company Logo
                </p>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={profile.logoUrl}
                    alt="Company logo"
                    className="max-h-24 max-w-full object-contain"
                  />
                </div>
                <a
                  href={profile.logoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  View full size →
                </a>
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">No logo provided</p>
              </div>
            )}

            {profile.proofOfOwnershipUrl ? (
              <div className="border rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Proof of Ownership
                </p>
                <a
                  href={profile.proofOfOwnershipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                >
                  <FileText className="w-4 h-4" />
                  View Document
                </a>
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">No proof of ownership provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Submission Details</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>User ID: {user.id.substring(0, 8)}...</span>
            <span>Profile ID: {profile.id.substring(0, 8)}...</span>
            <span>Created: {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <ApprovalActions
            profileId={profile.id}
            userId={user.id}
            userEmail={user.email}
            profileType="company"
            profileName={profile.companyName}
          />
        )}
      </CardContent>
    </Card>
  )
}

// Reusable component for rendering freelancer profile cards
function FreelancerProfileCard({ profile, user, showActions = false }: { profile: any, user: any, showActions?: boolean }) {
  return (
    <Card key={profile.id} className="overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
              </div>
            </div>
          </div>
          <Badge className={
            profile.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
            profile.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-300' :
            'bg-red-100 text-red-800 border-red-300'
          }>
            {profile.verificationStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
            {profile.verificationStatus === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
            {profile.verificationStatus === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
            {profile.verificationStatus.charAt(0).toUpperCase() + profile.verificationStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location
              </p>
              <p className="text-sm font-medium text-gray-900">{profile.location}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                WhatsApp Number
              </p>
              <p className="text-sm font-medium text-gray-900">{profile.whatsappNumber}</p>
            </div>
          </div>
        </div>

        {/* Equipment */}
        {profile.equipmentList && profile.equipmentList.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Equipment</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {profile.equipmentList.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolioLinks && profile.portfolioLinks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Portfolio Links
            </h3>
            <div className="space-y-2">
              {profile.portfolioLinks.map((link: string, index: number) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <LinkIcon className="w-4 h-4" />
                  {new URL(link).hostname}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Documents & Media */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents & Media
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {profile.photoUrl ? (
              <div className="border rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Profile Photo
                </p>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={profile.photoUrl}
                    alt="Profile"
                    className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-md"
                  />
                </div>
                <a
                  href={profile.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                >
                  View full size →
                </a>
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">No profile photo provided</p>
              </div>
            )}

            {profile.idProofUrl ? (
              <div className="border rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  ID Proof
                </p>
                <a
                  href={profile.idProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                >
                  <FileText className="w-4 h-4" />
                  View Document
                </a>
              </div>
            ) : (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs">No ID proof provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-2">Submission Details</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>User ID: {user.id.substring(0, 8)}...</span>
            <span>Profile ID: {profile.id.substring(0, 8)}...</span>
            <span>Created: {new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <ApprovalActions
            profileId={profile.id}
            userId={user.id}
            userEmail={user.email}
            profileType="freelancer"
            profileName={profile.name}
          />
        )}
      </CardContent>
    </Card>
  )
}

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

  // Get rejected profiles
  const rejectedCompanies = await db
    .select({
      profile: companyProfiles,
      user: users,
    })
    .from(companyProfiles)
    .innerJoin(users, eq(users.id, companyProfiles.userId))
    .where(eq(companyProfiles.verificationStatus, 'rejected'))

  const rejectedFreelancers = await db
    .select({
      profile: freelancerProfiles,
      user: users,
    })
    .from(freelancerProfiles)
    .innerJoin(users, eq(users.id, freelancerProfiles.userId))
    .where(eq(freelancerProfiles.verificationStatus, 'rejected'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Approvals</h1>
        <p className="text-gray-600 mt-1">Review and manage user profiles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold">{pendingCompanies.length + pendingFreelancers.length}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-3xl font-bold">{verifiedCompanies.length + verifiedFreelancers.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold">{rejectedCompanies.length + rejectedFreelancers.length}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold">{pendingCompanies.length + pendingFreelancers.length + verifiedCompanies.length + verifiedFreelancers.length + rejectedCompanies.length + rejectedFreelancers.length}</p>
              </div>
              <UserIcon className="w-10 h-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs - Status */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingCompanies.length + pendingFreelancers.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved ({verifiedCompanies.length + verifiedFreelancers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected ({rejectedCompanies.length + rejectedFreelancers.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Tabs defaultValue="companies">
            <TabsList>
              <TabsTrigger value="companies">
                <Building className="w-4 h-4 mr-2" />
                Companies ({pendingCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="freelancers">
                <UserIcon className="w-4 h-4 mr-2" />
                Freelancers ({pendingFreelancers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="companies" className="space-y-6 mt-6">
              {pendingCompanies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No pending company approvals</p>
                  </CardContent>
                </Card>
              ) : (
                pendingCompanies.map(({ profile, user }) => (
                  <CompanyProfileCard key={profile.id} profile={profile} user={user} showActions={true} />
                ))
              )}
            </TabsContent>

            <TabsContent value="freelancers" className="space-y-6 mt-6">
              {pendingFreelancers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No pending freelancer approvals</p>
                  </CardContent>
                </Card>
              ) : (
                pendingFreelancers.map(({ profile, user }) => (
                  <FreelancerProfileCard key={profile.id} profile={profile} user={user} showActions={true} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved" className="space-y-4">
          <Tabs defaultValue="companies">
            <TabsList>
              <TabsTrigger value="companies">
                <Building className="w-4 h-4 mr-2" />
                Companies ({verifiedCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="freelancers">
                <UserIcon className="w-4 h-4 mr-2" />
                Freelancers ({verifiedFreelancers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="companies" className="space-y-6 mt-6">
              {verifiedCompanies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No approved companies</p>
                  </CardContent>
                </Card>
              ) : (
                verifiedCompanies.map(({ profile, user }) => (
                  <CompanyProfileCard key={profile.id} profile={profile} user={user} showActions={false} />
                ))
              )}
            </TabsContent>

            <TabsContent value="freelancers" className="space-y-6 mt-6">
              {verifiedFreelancers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No approved freelancers</p>
                  </CardContent>
                </Card>
              ) : (
                verifiedFreelancers.map(({ profile, user }) => (
                  <FreelancerProfileCard key={profile.id} profile={profile} user={user} showActions={false} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-4">
          <Tabs defaultValue="companies">
            <TabsList>
              <TabsTrigger value="companies">
                <Building className="w-4 h-4 mr-2" />
                Companies ({rejectedCompanies.length})
              </TabsTrigger>
              <TabsTrigger value="freelancers">
                <UserIcon className="w-4 h-4 mr-2" />
                Freelancers ({rejectedFreelancers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="companies" className="space-y-6 mt-6">
              {rejectedCompanies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No rejected companies</p>
                  </CardContent>
                </Card>
              ) : (
                rejectedCompanies.map(({ profile, user }) => (
                  <CompanyProfileCard key={profile.id} profile={profile} user={user} showActions={false} />
                ))
              )}
            </TabsContent>

            <TabsContent value="freelancers" className="space-y-6 mt-6">
              {rejectedFreelancers.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No rejected freelancers</p>
                  </CardContent>
                </Card>
              ) : (
                rejectedFreelancers.map(({ profile, user }) => (
                  <FreelancerProfileCard key={profile.id} profile={profile} user={user} showActions={false} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
