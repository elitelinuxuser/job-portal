'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createReport } from '@/lib/actions/reports'
import { REPORT_REASONS, ReportType } from '@/lib/constants/report-reasons'
import { toast } from 'sonner'
import { Flag, AlertTriangle, X } from 'lucide-react'

interface ReportDialogProps {
  reportType: ReportType
  targetId: string
  targetName: string
  triggerButton?: React.ReactNode
}

export function ReportDialog({
  reportType,
  targetId,
  targetName,
  triggerButton,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')

  const reasons = REPORT_REASONS[reportType]

  const typeLabels: Record<ReportType, string> = {
    job_post: 'Job Post',
    freelancer: 'Freelancer',
    company: 'Company',
  }

  async function handleSubmit() {
    if (!reason) {
      toast.error('Please select a reason for your report')
      return
    }

    setLoading(true)
    try {
      const result = await createReport({
        reportType,
        targetId,
        reason,
        description: description.trim() || undefined,
      })

      if (result.success) {
        toast.success('Report submitted successfully. Our team will review it.')
        setOpen(false)
        setReason('')
        setDescription('')
      } else {
        toast.error(result.error || 'Failed to submit report')
      }
    } catch (error) {
      toast.error('Failed to submit report')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      ) : (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-500 hover:text-red-600"
          onClick={() => setOpen(true)}
        >
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent 
          side="bottom" 
          className="h-auto max-h-[90vh] px-0 pb-0 gap-0 pt-0 border-none rounded-t-3xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative bg-linear-to-br from-red-600 via-red-500 to-orange-500 px-6 pt-6 pb-6 shrink-0">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="pr-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <SheetTitle className="text-xl font-bold text-white">
                  Report {typeLabels[reportType]}
                </SheetTitle>
              </div>
              
              <SheetDescription className="text-red-50 text-sm">
                Report &quot;{targetName}&quot; for violating our community guidelines.
              </SheetDescription>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 bg-white">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">Why are you reporting this?</Label>
                <RadioGroup value={reason} onValueChange={setReason}>
                  {reasons.map((r) => (
                    <div key={r} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100">
                      <RadioGroupItem value={r} id={r} />
                      <Label htmlFor={r} className="text-sm cursor-pointer flex-1 font-medium">
                        {r}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
                  Additional details (optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional context that might help us understand the issue..."
                  rows={3}
                  className="border-2 focus:border-red-500"
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">Important</p>
                  <p className="text-xs text-amber-800">
                    False reports may result in action against your account. Only report genuine violations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 shrink-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 h-11 text-sm font-semibold border-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !reason}
                className="flex-1 h-11 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
