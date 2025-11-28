'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SendBookingRequest } from '@/components/company/send-booking-request'
import { 
  IndianRupee, 
  Calendar, 
  MessageSquare, 
  User, 
  Briefcase,
  MapPin,
  Phone,
  Shield,
  ExternalLink,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import type { JobResponseWithRelations } from '@/types/job-responses'
import { markResponseAsViewed } from '@/lib/actions/jobs'

interface ResponsesListProps {
  responses: JobResponseWithRelations[]
}

export function ResponsesList({ responses }: ResponsesListProps) {
  const [selectedResponse, setSelectedResponse] = useState<JobResponseWithRelations | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  const unreadResponses = responses.filter(r => !r.viewedAt)
  const displayedResponses = activeTab === 'unread' ? unreadResponses : responses

  const openResponseDetails = async (response: JobResponseWithRelations) => {
    setSelectedResponse(response)
    setIsDialogOpen(true)
    
    // Mark as viewed when opening the dialog
    if (!response.viewedAt) {
      await markResponseAsViewed(response.id)
    }
  }

  if (responses.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Responses Yet
          </h3>
          <p className="text-gray-600 text-center">
            Post jobs to start receiving applications from freelancers
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Tabs */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className='text-sm'>All</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {responses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'unread'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className='text-sm'>Unread</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === 'unread' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {unreadResponses.length}
            </span>
          </button>
        </div>
      </div>

      {displayedResponses.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Unread Responses
          </h3>
          <p className="text-gray-600">
            All responses have been viewed
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {displayedResponses.map((response, index) => {
            const isUnread = !response.viewedAt
            
            return (
              <div
                key={response.id}
                className={`group cursor-pointer transition-all duration-150 border-l-4 ${
                  isUnread 
                    ? 'bg-white border-l-indigo-600 hover:bg-indigo-50/50' 
                    : 'bg-gray-50/50 border-l-transparent hover:bg-gray-100/50'
                } ${index !== displayedResponses.length - 1 ? 'border-b border-gray-200' : ''}`}
                onClick={() => openResponseDetails(response)}
              >
                <div className="px-4 py-4">
                  {/* Header - Freelancer and Job */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0 text-sm">
                      {(response.freelancer.freelancerProfile?.name || 'F').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <h3 className={`truncate ${
                          isUnread ? 'font-semibold text-gray-900' : 'font-normal text-gray-700'
                        }`}>
                          {response.freelancer.freelancerProfile?.name || 'Freelancer'}
                        </h3>
                        <span className="text-xs text-gray-500 shrink-0">
                          {format(new Date(response.createdAt), 'MMM d')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                        <Briefcase className="w-3 h-3 shrink-0 text-gray-400" />
                        <span className="truncate">{response.job.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="pl-13">
                    {response.message ? (
                      <p className={`text-sm line-clamp-2 leading-relaxed mb-2 ${
                        isUnread ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {response.message}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-2">No message provided</p>
                    )}
                    
                    {/* Price badge */}
                    {response.proposedPrice && (
                      <div className="flex items-center gap-1 text-xs">
                        <IndianRupee className="w-3.5 h-3.5 text-green-700" />
                        <span className="font-semibold text-green-700">₹{response.proposedPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Response Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedResponse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Response Details
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Job Info */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-indigo-700 font-medium mb-1">Job</p>
                      <h4 className="font-semibold text-gray-900">{selectedResponse.job.title}</h4>
                    </div>
                  </div>
                </div>

                {/* Freelancer Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">Freelancer Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Name</p>
                          <p className="font-semibold text-gray-900">
                            {selectedResponse.freelancer.freelancerProfile?.name || 'Not provided'}
                          </p>
                        </div>
                      </div>

                      {selectedResponse.freelancer.freelancerProfile?.location && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <MapPin className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-600">Location</p>
                            <p className="font-semibold text-gray-900">
                              {selectedResponse.freelancer.freelancerProfile.location}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedResponse.freelancer.freelancerProfile?.whatsappNumber && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Phone className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-600">WhatsApp</p>
                            <p className="font-semibold text-gray-900">
                              {selectedResponse.freelancer.freelancerProfile.whatsappNumber}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedResponse.freelancer.freelancerProfile?.verificationStatus && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Shield className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-600">Verification</p>
                            <Badge variant="outline" className="mt-1">
                              {selectedResponse.freelancer.freelancerProfile.verificationStatus}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Equipment */}
                    {selectedResponse.freelancer.freelancerProfile?.equipmentList && 
                     (selectedResponse.freelancer.freelancerProfile.equipmentList as string[]).length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Equipment</p>
                        <div className="flex flex-wrap gap-2">
                          {(selectedResponse.freelancer.freelancerProfile.equipmentList as string[]).map((item, idx) => (
                            <Badge key={idx} variant="secondary">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Portfolio */}
                    {selectedResponse.freelancer.freelancerProfile?.portfolioLinks &&
                     (selectedResponse.freelancer.freelancerProfile.portfolioLinks as string[]).length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Portfolio Links</p>
                        <div className="flex flex-wrap gap-2">
                          {(selectedResponse.freelancer.freelancerProfile.portfolioLinks as string[]).map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                            >
                              Portfolio {idx + 1}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proposed Price */}
                {selectedResponse.proposedPrice && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-700 font-medium mb-1">Proposed Price</p>
                        <p className="text-2xl font-bold text-green-900">₹{selectedResponse.proposedPrice}</p>
                        {selectedResponse.job.budget && selectedResponse.proposedPrice !== selectedResponse.job.budget && (
                          <p className="text-sm text-gray-600 mt-1">
                            Original budget: ₹{selectedResponse.job.budget}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                {selectedResponse.message && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      Message
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedResponse.message}</p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t">
                  <Calendar className="w-4 h-4" />
                  <span>Received on {format(new Date(selectedResponse.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Link href={`/company/jobs/${selectedResponse.job.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Briefcase className="w-4 h-4" />
                      View Job Details
                    </Button>
                  </Link>
                  <Link href={`/freelancer/profile/${selectedResponse.freelancerId}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <User className="w-4 h-4" />
                      View Freelancer Profile
                    </Button>
                  </Link>
                  <div className="flex-1">
                    <SendBookingRequest
                      jobId={selectedResponse.job.id}
                      freelancerId={selectedResponse.freelancerId}
                      freelancerName={selectedResponse.freelancer.freelancerProfile?.name || 'Freelancer'}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
