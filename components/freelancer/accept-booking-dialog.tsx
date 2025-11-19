'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { respondToBooking } from '@/lib/actions/freelancer'
import { toast } from 'sonner'
import { CheckCircle, FileText, Calendar, MapPin, DollarSign, Clock } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function AcceptBookingDialog({ booking }: { booking: any }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'overview' | 'contract' | 'success'>('overview')
  const [loading, setLoading] = useState(false)

  const contract = booking.contractDetails as any

  async function handleAccept() {
    setLoading(true)
    try {
      const result = await respondToBooking({
        bookingId: booking.id,
        accept: true,
      })
      if (result.success) {
        setStep('success')
      }
    } catch (error) {
      toast.error('Failed to accept booking')
      console.error(error)
      setLoading(false)
    }
  }

  function handleDecline() {
    setOpen(false)
    setStep('overview')
  }

  function downloadCalendar() {
    // Generate ICS file
    const dates = contract.dates as string[]
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Freelancer Platform//EN
BEGIN:VEVENT
UID:${booking.id}@freelancer-platform.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${dates[0].replace(/[-]/g, '')}T${contract.time.split('-')[0].trim().replace(/[: ]/g, '')}00
SUMMARY:${contract.title}
DESCRIPTION:${contract.description}
LOCATION:${contract.location}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${contract.title.replace(/\s+/g, '-')}.ics`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Calendar event downloaded!')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          Accept Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'overview' && (
          <>
            <DialogHeader>
              <DialogTitle>Booking Overview</DialogTitle>
              <DialogDescription>
                Review the booking details before proceeding
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-lg">{contract.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{contract.description}</p>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{contract.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Dates</p>
                    <div className="flex flex-wrap gap-1">
                      {contract.dates.map((date: string, idx: number) => (
                        <Badge key={idx} variant="outline">{date}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">{contract.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Payment</p>
                    <p className="font-medium">₹{contract.budget}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-2">Company Contact:</p>
                <p className="font-medium">{booking.company.companyProfile?.whatsappNumber}</p>
              </div>
            </div>
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={handleDecline} className="flex-1">
                Decline
              </Button>
              <Button onClick={() => setStep('contract')} className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                View Contract
              </Button>
            </div>
          </>
        )}

        {step === 'contract' && (
          <>
            <DialogHeader>
              <DialogTitle>Contract Terms</DialogTitle>
              <DialogDescription>
                Please review the contract carefully before accepting
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h4 className="font-semibold">Contract Terms:</h4>
                {contract.contractContentPosting && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Content Posting Rights</p>
                      <p className="text-sm text-gray-600">Company has rights to post content on their platforms</p>
                    </div>
                  </div>
                )}
                {contract.contractAdvancePayment && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Advance Payment</p>
                      <p className="text-sm text-gray-600">Partial payment to be made in advance</p>
                    </div>
                  </div>
                )}
                {contract.contractPaymentAfterShot && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Payment After Shot</p>
                      <p className="text-sm text-gray-600">Remaining payment after work completion</p>
                    </div>
                  </div>
                )}
                {contract.contractContentOwnership && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Content Ownership</p>
                      <p className="text-sm text-gray-600">Ownership rights as per agreement</p>
                    </div>
                  </div>
                )}
                {contract.contractSdCard && (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">SD Card Handover</p>
                      <p className="text-sm text-gray-600">Physical SD card to be provided</p>
                    </div>
                  </div>
                )}
              </div>

              {contract.contractAdditionalDetails && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Additional Terms:</h4>
                  <p className="text-sm text-gray-700">{contract.contractAdditionalDetails}</p>
                </div>
              )}

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Important:</strong> By clicking "I Accept", you agree to all the terms mentioned above 
                  and commit to completing this booking as per the contract.
                </p>
              </div>
            </div>
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={handleDecline} className="flex-1">
                Decline
              </Button>
              <Button onClick={handleAccept} disabled={loading} className="flex-1">
                {loading ? 'Accepting...' : 'I Accept'}
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                Booking Confirmed!
              </DialogTitle>
              <DialogDescription>
                You have successfully accepted this booking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">All Set!</h3>
                <p className="text-gray-600">
                  The company will contact you via WhatsApp to coordinate the details.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Next Steps:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Wait for the company to reach out on WhatsApp</li>
                  <li>• Prepare your equipment as per the requirements</li>
                  <li>• Review the dates and location once more</li>
                  <li>• Add the event to your calendar</li>
                </ul>
              </div>

              <Button onClick={downloadCalendar} variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => {
                setOpen(false)
                setStep('overview')
                window.location.reload()
              }}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}



