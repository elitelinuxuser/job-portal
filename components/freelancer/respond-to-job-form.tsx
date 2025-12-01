'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { respondToJob } from '@/lib/actions/freelancer'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Send, IndianRupee } from 'lucide-react'

export function RespondToJobForm({ 
  jobId, 
  originalBudget,
  onSuccess 
}: { 
  jobId: string
  originalBudget?: string | null
  onSuccess?: () => void 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [proposedPrice, setProposedPrice] = useState(originalBudget || '')

  async function handleApply() {
    setLoading(true)
    try {
      const result = await respondToJob({
        jobId,
        status: 'interested',
        message: message || undefined,
        proposedPrice: proposedPrice || undefined,
      })

      if (result.success) {
        toast.success('Application submitted! The company will review your application.')
        onSuccess?.()
        router.push('/freelancer')
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Proposed Price */}
      <div className="space-y-3">
        <Label htmlFor="proposedPrice" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4 text-green-600" />
          </span>
          Your Proposed Price
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <span className="text-base font-medium text-gray-700">₹</span>
          </div>
          <Input
            id="proposedPrice"
            type="number"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            placeholder={originalBudget || "Enter your price"}
            className="pl-8 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors rounded-xl text-base h-12"
          />
        </div>
        {originalBudget && (
          <p className="text-sm text-gray-500">
            Original budget: ₹{originalBudget}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-3">
        <Label htmlFor="message" className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-blue-600" />
          </span>
          Message to Company
          <span className="text-sm font-normal text-gray-500">(Optional)</span>
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself and explain why you're a good fit for this project..."
          rows={6}
          className="resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors rounded-xl text-base"
        />
        <p className="text-sm text-gray-500 flex items-center gap-1">
          💡 <span>Tip: Mention your relevant experience and availability</span>
        </p>
      </div>

      <Button
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200"
        onClick={handleApply}
        disabled={loading}
      >
        <Send className="w-5 h-5 mr-2" />
        {loading ? 'Submitting Application...' : 'Apply Now'}
      </Button>
    </div>
  )
}



