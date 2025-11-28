'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetHeader } from '@/components/ui/sheet'
import { RespondToJobForm } from './respond-to-job-form'
import { Badge } from '@/components/ui/badge'
import { Briefcase, IndianRupee, Sparkles, X, Award, CheckCircle2, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface JobDetailsClientProps {
  job: {
    id: string
    title: string
    budget: string
  }
  hasResponded: boolean
  isVerified: boolean
  myResponse?: {
    proposedPrice: string | null
    message: string | null
    createdAt: Date
  } | null
}

export function JobDetailsClient({ job, hasResponded, isVerified, myResponse }: JobDetailsClientProps) {
  const [open, setOpen] = useState(false)

  console.log(isVerified)

  return (
    <>
      {/* Sticky Bottom CTA - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="p-4">
          <Button 
            className={`w-full h-14 text-lg font-semibold shadow-md ${
              hasResponded 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                : !isVerified
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
            }`}
            onClick={() => setOpen(true)}
          >
            {hasResponded ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                View My Application
              </>
            ) : !isVerified ? (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Profile Under Review
              </>
            ) : (
              'Apply Now'
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="bottom" 
          className="h-auto max-h-[92vh] px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden"
          hideClose
        >
          {hasResponded && myResponse ? (
            <>
              {/* Application Details Header */}
              <div className="relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-500 px-6 pt-6 pb-6">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="pr-12">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Submitted
                    </Badge>
                  </div>
                  
                  <SheetTitle className="text-2xl font-bold text-white mb-2">
                    Your Application
                  </SheetTitle>
                  
                  <SheetDescription className="text-green-50 text-base">
                    {job.title}
                  </SheetDescription>
                </div>
              </div>

              {/* Application Details Content */}
              <div className="px-6 pt-6 pb-6 bg-white space-y-4">
                {/* Proposed Budget */}
                <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium mb-1">Your Proposed Budget</p>
                    <p className="text-xl font-bold text-green-800">₹{myResponse.proposedPrice || job.budget}</p>
                  </div>
                </div>

                {/* Message */}
                {myResponse.message && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      Your Message
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{myResponse.message}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    className="w-full bg-gray-900 hover:bg-gray-800"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          ) : !isVerified ? (
            <>
              {/* Pending Approval Header */}
              <div className="relative bg-gradient-to-br from-amber-600 via-orange-500 to-orange-600 px-6 pt-6 pb-6">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="pr-12">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  
                  <SheetTitle className="text-2xl font-bold text-white mb-2">
                    Profile Under Review
                  </SheetTitle>
                  
                  <SheetDescription className="text-orange-50 text-base">
                    {job.title}
                  </SheetDescription>
                </div>
              </div>

              {/* Pending Approval Content */}
              <div className="px-6 pt-6 pb-6 bg-white space-y-4">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 mb-1">Application Restricted</p>
                    <p className="text-sm text-amber-800">
                      Your profile is currently under review. You&apos;ll be able to apply for jobs once your profile is verified by our team.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Review Status:</strong> This process typically takes 12-24 hours. You&apos;ll receive an email notification once your profile is approved.
                  </p>
                </div>

                <div className="space-y-2">
                  <Link href="/freelancer/pending" className="block">
                    <Button variant="outline" className="w-full">
                      View Approval Status
                    </Button>
                  </Link>
                  <Button 
                    className="w-full bg-gray-900 hover:bg-gray-800"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Enhanced Header with Gradient */}
              <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-6 pt-6 pb-6">
                {/* Close Button */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="mb-3 pr-12">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Quick Apply
                    </Badge>
                  </div>
                  
                  <SheetTitle className="text-2xl font-bold text-white mb-2 pr-0">
                    Apply for this Job
                  </SheetTitle>
                  
                  <SheetDescription className="text-blue-50 text-base font-medium line-clamp-2 mb-3">
                    {job.title}
                  </SheetDescription>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-6 pt-6 pb-6 bg-white">
                <RespondToJobForm 
                  jobId={job.id} 
                  originalBudget={job.budget}
                  onSuccess={() => setOpen(false)} 
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
