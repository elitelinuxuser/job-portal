'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, IndianRupee, Clock, CheckCheck, XCircle, Package, CheckCircle2, ArrowRight, Sparkles, FileText, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { getJobTypeLabel, JobType } from '@/lib/constants/job-types'
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
  const closedApps = applications.filter(app => !isUnderReview(app))
  
  // Calculate stats
  const stats = useMemo(() => {
    return { 
      total: applications.length,
      underReview: underReviewApps.length
    }
  }, [applications.length, underReviewApps.length])
  
  const displayedApps = activeTab === 'under-review' ? underReviewApps : closedApps
  
  const renderApplicationsList = () => {
    if (displayedApps.length === 0) {
      return (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {activeTab === 'under-review' ? 'No Active Applications' : 'No Closed Applications'}
            </h3>
            <p className="text-gray-600 text-center text-sm">
              {activeTab === 'under-review' 
                ? "You don't have any applications currently under review." 
                : "You don't have any closed applications yet."}
            </p>
            {activeTab === 'under-review' && (
              <Link href="/freelancer" className='mt-4'>
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
      <div className="space-y-3">
        {displayedApps.map((application) => {
          const statusBadge = getStatusBadge(application)
          const StatusIcon = statusBadge.icon
          
          // Don't show status badge for under-review tab
          const showStatusBadge = activeTab !== 'under-review'
          
          return (
            <Card key={application.id} className="group hover:shadow-md transition-all duration-200 border-l-4" style={{ borderLeftColor: getStatusColor(statusBadge.label) }}>
              <CardContent className="px-5">
                <Link href={`/freelancer/applications/${application.id}`}>
                  <div className="flex items-start gap-4">
                    {/* Left side - Job info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Top row - Job types and Date */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        {/* Job types */}
                        {application.job.jobTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {application.job.jobTypes.slice(0, 3).map((type) => (
                              <span key={type} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                {getJobTypeLabel(type)}
                              </span>
                            ))}
                            {application.job.jobTypes.length > 1 && (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                                +{application.job.jobTypes.length - 1}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Date Applied */}
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 shrink-0 text-gray-400" />
                          <span>
                            {format(new Date(application.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Title row with optional status */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                          {application.job.title}
                        </h3>
                        {showStatusBadge && (
                          <Badge className={`${statusBadge.color} flex items-center gap-1.5 shrink-0 px-3 py-1`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span className="font-medium">{statusBadge.label}</span>
                          </Badge>
                        )}
                      </div>
                      
                      {/* Meta information - Company and Amount */}
                      <div className="flex items-center gap-4 flex-wrap text-sm">
                        {/* Company */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4 shrink-0 text-gray-400" />
                          <span className="truncate font-medium">
                            {application.job.company.companyProfile?.companyName || 'Company'}
                          </span>
                        </div>
                        
                        {/* Proposed Amount */}
                        {application.proposedPrice && (
                          <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <IndianRupee className="w-4 h-4 shrink-0" />
                            <span>{application.proposedPrice}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right side - View details arrow */}
                    <div className="shrink-0 pt-1">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
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

  return (
    <div className="w-full space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className='px-4'>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 mb-0.5">Total Applications</p>
                <p className="text-xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className='px-4'>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 mb-0.5">Under Review</p>
                <p className="text-xl font-bold text-amber-900">{stats.underReview}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Custom Pills Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('under-review')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'under-review'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className='text-sm'>Under Review</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'under-review' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {underReviewApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('closed')}
          className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'closed'
              ? 'bg-gray-700 text-white shadow-lg shadow-gray-700/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className='text-sm'>Closed</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'closed' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {closedApps.length}
          </span>
        </button>
      </div>

      {/* Content */}
      <div>
        {renderApplicationsList()}
      </div>
    </div>
  )
}

// Helper function to get status colors
function getStatusColor(label: string): string {
  switch (label) {
    case 'Under Review':
      return '#3b82f6' // blue
    case 'Booking Sent':
      return '#f59e0b' // amber
    case 'Accepted':
      return '#10b981' // green
    case 'Declined':
      return '#ef4444' // red
    case 'Completed':
      return '#8b5cf6' // purple
    case 'Job Closed':
      return '#6b7280' // gray
    default:
      return '#6b7280'
  }
}
