'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, IndianRupee, Clock, CheckCheck, XCircle, Package, CheckCircle2, ArrowRight, Sparkles, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { JobType } from '@/lib/constants/job-types'
import Link from 'next/link'

interface Application {
  id: string
  status: 'interested' | 'not_interested'
  message: string | null
  proposedPrice: string | null
  createdAt: Date
  job: {
    id: string
    title: string
    description: string
    budget: string | null
    location: string
    jobTypes: JobType[]
    dates: Array<{ date: string }>
    isActive: boolean
    company: {
      id: string
      companyProfile: {
        companyName: string
      } | null
    }
    bookingRequests: Array<{
      id: string
      status: 'pending' | 'accepted' | 'rejected' | 'completed'
      createdAt: Date
      updatedAt: Date
    }>
  }
}

interface ApplicationsWithTabsProps {
  applications: Application[]
}

// Helper function to determine if application is "under review"
function isUnderReview(application: Application) {
  const booking = application.job.bookingRequests[0]
  
  // Under review if: no booking OR booking is pending OR job is still active
  if (!booking) return application.job.isActive
  
  return booking.status === 'pending' && application.job.isActive
}

// Helper function to get status badge
function getStatusBadge(application: Application) {
  const booking = application.job.bookingRequests[0]
  
  if (!application.job.isActive) {
    return { label: 'Job Closed', color: 'bg-gray-100 text-gray-800', icon: XCircle }
  }
  
  if (!booking) {
    return { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: Clock }
  }
  
  switch (booking.status) {
    case 'pending':
      return { label: 'Booking Sent', color: 'bg-amber-100 text-amber-800', icon: Package }
    case 'accepted':
      return { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCheck }
    case 'rejected':
      return { label: 'Declined', color: 'bg-red-100 text-red-800', icon: XCircle }
    case 'completed':
      return { label: 'Completed', color: 'bg-purple-100 text-purple-800', icon: CheckCircle2 }
  }
}

export function ApplicationsWithTabs({ applications }: ApplicationsWithTabsProps) {
  const [activeTab, setActiveTab] = useState('under-review')
  
  // Separate applications
  const underReviewApps = applications.filter(isUnderReview)
  const pastApps = applications.filter(app => !isUnderReview(app))
  
  const renderApplicationsList = (apps: Application[]) => {
    if (apps.length === 0) {
      return (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'under-review' ? 'No Active Applications' : 'No Past Applications'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {activeTab === 'under-review' 
                ? "You don't have any applications currently under review." 
                : "You don't have any past applications yet."}
            </p>
            {activeTab === 'under-review' && (
              <Link href="/freelancer">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <Sparkles className="w-4 h-4" />
                  Browse Jobs
                </button>
              </Link>
            )}
          </CardContent>
        </Card>
      )
    }
    
    return (
      <div className="grid gap-4">
        {apps.map((application) => {
          const statusBadge = getStatusBadge(application)
          const StatusIcon = statusBadge.icon
          
          return (
            <Card key={application.id} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <Link href={`/freelancer/applications/${application.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Job info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                        {application.job.title}
                      </h3>
                      
                      <div className="space-y-2">
                        {/* Company */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            {application.job.company.companyProfile?.companyName || 'Company'}
                          </span>
                        </div>
                        
                        {/* Date Applied */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>
                            Applied {format(new Date(application.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        {/* Proposed Amount */}
                        {application.proposedPrice && (
                          <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                            <IndianRupee className="w-4 h-4 shrink-0" />
                            <span>
                              Proposed: {application.proposedPrice}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - Status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className={`${statusBadge.color} flex items-center gap-1.5`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </Badge>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const filteredApps = activeTab === 'under-review' ? underReviewApps : pastApps
  
  return (
    <div className="w-full">
      {/* Custom Pills Navigation */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveTab('under-review')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'under-review'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Under Review</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'under-review' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {underReviewApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'past'
              ? 'bg-gray-700 text-white shadow-lg shadow-gray-700/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>Past</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'past' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {pastApps.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div>
        {renderApplicationsList(filteredApps)}
      </div>
    </div>
  )
}
