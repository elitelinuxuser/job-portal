'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
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
  FileText,
  Award,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import type { JobResponseWithRelations } from '@/types/job-responses'
import { markResponseAsViewed } from '@/lib/actions/jobs'

interface ResponsesListProps {
  responses: JobResponseWithRelations[]
}

export function ResponsesList({ responses }: ResponsesListProps) {
  const [selectedResponse, setSelectedResponse] = useState<JobResponseWithRelations | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false) // For mobile sheet
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  const unreadResponses = responses.filter(r => !r.viewedAt)
  const displayedResponses = activeTab === 'unread' ? unreadResponses : responses

  const openResponseDetails = async (response: JobResponseWithRelations, isMobile: boolean = false) => {
    setSelectedResponse(response)
    if (isMobile) {
      setIsDialogOpen(true)
    }
    
    // Mark as viewed when opening
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

      {/* Desktop: Split Layout | Mobile: List Only */}
      <div className="flex gap-4 h-[calc(100vh-300px)] min-h-[600px]">
        {/* Left Panel: Responses List */}
        <div className="w-full lg:w-96 flex flex-col shrink-0">
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
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 overflow-y-auto">
              {displayedResponses.map((response, index) => {
            const isUnread = !response.viewedAt
            
            return (
              <div
                key={response.id}
                className={`group cursor-pointer transition-all duration-150 border-l-4 ${
                  isUnread 
                    ? 'bg-white border-l-indigo-600 hover:bg-indigo-50/50' 
                    : 'bg-gray-50/50 border-l-transparent hover:bg-gray-100/50'
                } ${selectedResponse?.id === response.id ? 'bg-indigo-50 border-l-indigo-600' : ''}
                ${index !== displayedResponses.length - 1 ? 'border-b border-gray-200' : ''}`}
                onClick={() => {
                  // Desktop: just select, Mobile: open sheet
                  const isMobile = window.innerWidth < 1024
                  openResponseDetails(response, isMobile)
                }}
              >
                <div className="px-4 py-4">
                  {/* Header - Freelancer and Job */}
                  <div className="flex items-start gap-3 mb-2">
                    {/* Profile Photo or Initial */}
                    {response.freelancer.freelancerProfile?.photoUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shrink-0">
                        <Image
                          src={response.freelancer.freelancerProfile.photoUrl}
                          alt={response.freelancer.freelancerProfile.name || 'Freelancer'}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0 text-sm">
                        {(response.freelancer.freelancerProfile?.name || 'F').charAt(0).toUpperCase()}
                      </div>
                    )}
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
        </div>

        {/* Right Panel: Response Details (Desktop Only) */}
        <div className="hidden lg:flex flex-1 flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          {!selectedResponse ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a response
              </h3>
              <p className="text-gray-600 text-center max-w-sm">
                Choose a freelancer response from the list to view details and send booking requests
              </p>
            </div>
          ) : (
            /* Response Details Content */
            <>
              {/* Gradient Header - Compact */}
              <div className="relative bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-5 pb-5 shrink-0">
                <div className="pr-12">
                  {/* Photo and Name Side by Side */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Profile Photo or Initial - Clickable */}
                    <Link href={`/freelancer/profile/${selectedResponse.freelancerId}`}>
                      {selectedResponse.freelancer.freelancerProfile?.photoUrl ? (
                        <div className="w-18 h-18 rounded-full overflow-hidden border-3 border-white/20 backdrop-blur-sm shrink-0 hover:border-white/40 transition-all cursor-pointer">
                          <Image
                            src={selectedResponse.freelancer.freelancerProfile.photoUrl}
                            alt={selectedResponse.freelancer.freelancerProfile.name || 'Freelancer'}
                            width={72}
                            height={72}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-3 border-white/10 shrink-0 hover:bg-white/30 transition-all cursor-pointer">
                          <User className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/freelancer/profile/${selectedResponse.freelancerId}`}>
                        <h2 className="text-xl font-bold text-white mb-1 hover:text-white/90 transition-colors cursor-pointer flex items-center gap-2">
                          {selectedResponse.freelancer.freelancerProfile?.name || 'Freelancer'}
                          <ExternalLink className="w-4 h-4 opacity-70" />
                        </h2>
                      </Link>
                      {selectedResponse.freelancer.freelancerProfile?.verificationStatus === 'verified' && (
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2.5 py-0.5 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-white/90 text-sm">
                    Response for: <Link 
                      href={`/company/jobs/${selectedResponse.job.id}`}
                      className="underline hover:text-white font-medium transition-colors"
                    >
                      {selectedResponse.job.title}
                    </Link>
                  </p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 bg-white space-y-6">
                {/* Rest of the content will be added */}
                {selectedResponse.proposedPrice && (
                  <div className="p-3 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-700 font-medium mb-0.5">Proposed Price</p>
                        <p className="font-bold text-green-900">{selectedResponse.proposedPrice}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedResponse.message && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      Message
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedResponse.message}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedResponse.freelancer.freelancerProfile?.location && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">Location</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedResponse.freelancer.freelancerProfile.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedResponse.freelancer.freelancerProfile?.whatsappNumber && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">WhatsApp</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedResponse.freelancer.freelancerProfile.whatsappNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedResponse.freelancer.freelancerProfile?.equipmentList && 
                 (selectedResponse.freelancer.freelancerProfile.equipmentList as string[]).length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      Equipment
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(selectedResponse.freelancer.freelancerProfile.equipmentList as string[]).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedResponse.freelancer.freelancerProfile?.portfolioLinks &&
                 (selectedResponse.freelancer.freelancerProfile.portfolioLinks as string[]).length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      Portfolio
                    </h3>
                    <div className="space-y-2">
                      {(selectedResponse.freelancer.freelancerProfile.portfolioLinks as string[]).map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-linear-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 rounded-xl border border-cyan-200 hover:border-cyan-300 transition-all group"
                        >
                          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">Portfolio {idx + 1}</p>
                            <p className="text-xs text-gray-600 truncate">{link}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-cyan-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Received on {format(new Date(selectedResponse.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="border-t bg-white px-6 py-4 shrink-0">
                <SendBookingRequest
                  jobId={selectedResponse.job.id}
                  freelancerId={selectedResponse.freelancerId}
                  freelancerName={selectedResponse.freelancer.freelancerProfile?.name || 'Freelancer'}
                  bookingRequest={selectedResponse.bookingRequest}
                  jobBudget={typeof selectedResponse.job.budget === 'number' ? selectedResponse.job.budget : parseFloat(selectedResponse.job.budget || '0') || 0}
                  proposedPrice={selectedResponse.proposedPrice ? parseFloat(selectedResponse.proposedPrice) : undefined}
                  className="w-full h-12 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base font-semibold shadow-md"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sheet - Bottom sheet on mobile only */}
      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent 
          side="bottom" 
          className="h-screen sm:h-auto sm:max-w-2xl lg:max-w-4xl p-0 gap-0 flex flex-col rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-right"
        >
          {selectedResponse && (
            <>
              {/* Gradient Header - Compact */}
              <div className="relative bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-5 pb-5 shrink-0">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="pr-12">
                  {/* Photo and Name Side by Side */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Profile Photo or Initial - Clickable */}
                    <Link href={`/freelancer/profile/${selectedResponse.freelancerId}`}>
                      {selectedResponse.freelancer.freelancerProfile?.photoUrl ? (
                        <div className="w-18 h-18 rounded-full overflow-hidden border-3 border-white/20 backdrop-blur-sm shrink-0 hover:border-white/40 transition-all cursor-pointer">
                          <Image
                            src={selectedResponse.freelancer.freelancerProfile.photoUrl}
                            alt={selectedResponse.freelancer.freelancerProfile.name || 'Freelancer'}
                            width={72}
                            height={72}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-3 border-white/10 shrink-0 hover:bg-white/30 transition-all cursor-pointer">
                          <User className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/freelancer/profile/${selectedResponse.freelancerId}`}>
                        <SheetTitle className="text-xl font-bold text-white mb-1 hover:text-white/90 transition-colors cursor-pointer flex items-center gap-2">
                          {selectedResponse.freelancer.freelancerProfile?.name || 'Freelancer'}
                          <ExternalLink className="w-4 h-4 opacity-70" />
                        </SheetTitle>
                      </Link>
                      {selectedResponse.freelancer.freelancerProfile?.verificationStatus === 'verified' && (
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-2.5 py-0.5 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <SheetDescription className="text-white/90 text-sm">
                    Response for: <Link 
                      href={`/company/jobs/${selectedResponse.job.id}`}
                      className="underline hover:text-white font-medium transition-colors"
                    >
                      {selectedResponse.job.title}
                    </Link>
                  </SheetDescription>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 bg-white space-y-6">
                {/* Proposed Price - Compact */}
                {selectedResponse.proposedPrice && (
                  <div className="p-3 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-700 font-medium mb-0.5">Proposed Price</p>
                        <p className="font-bold text-green-900">{selectedResponse.proposedPrice}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                {selectedResponse.message && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      Message
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedResponse.message}</p>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedResponse.freelancer.freelancerProfile?.location && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">Location</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedResponse.freelancer.freelancerProfile.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedResponse.freelancer.freelancerProfile?.whatsappNumber && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 mb-0.5">WhatsApp</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedResponse.freelancer.freelancerProfile.whatsappNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Equipment */}
                {selectedResponse.freelancer.freelancerProfile?.equipmentList && 
                 (selectedResponse.freelancer.freelancerProfile.equipmentList as string[]).length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      Equipment
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(selectedResponse.freelancer.freelancerProfile.equipmentList as string[]).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {selectedResponse.freelancer.freelancerProfile?.portfolioLinks &&
                 (selectedResponse.freelancer.freelancerProfile.portfolioLinks as string[]).length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      Portfolio
                    </h3>
                    <div className="space-y-2">
                      {(selectedResponse.freelancer.freelancerProfile.portfolioLinks as string[]).map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-linear-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 rounded-xl border border-cyan-200 hover:border-cyan-300 transition-all group"
                        >
                          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">Portfolio {idx + 1}</p>
                            <p className="text-xs text-gray-600 truncate">{link}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-cyan-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Received on {format(new Date(selectedResponse.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                </div>
              </div>

              {/* Sticky Bottom CTA */}
              <div className="sticky bottom-0 left-0 right-0 bg-white border-t px-6 py-4 shrink-0">
                <SendBookingRequest
                  jobId={selectedResponse.job.id}
                  freelancerId={selectedResponse.freelancerId}
                  freelancerName={selectedResponse.freelancer.freelancerProfile?.name || 'Freelancer'}
                  bookingRequest={selectedResponse.bookingRequest}
                  jobBudget={typeof selectedResponse.job.budget === 'number' ? selectedResponse.job.budget : parseFloat(selectedResponse.job.budget || '0') || 0}
                  proposedPrice={selectedResponse.proposedPrice ? parseFloat(selectedResponse.proposedPrice) : undefined}
                  className="w-full h-12 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-base font-semibold shadow-md"
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
