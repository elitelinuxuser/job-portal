'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RoleSelectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'company' | 'freelancer' | null>(null)

  function selectRole(role: 'company' | 'freelancer') {
    if (!loading) {
      setSelectedRole(role)
    }
  }

  async function handleContinue() {
    if (!selectedRole || loading) return
    
    setLoading(true)

    try {
      const response = await fetch('/api/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set role')
      }

      toast.success(`Welcome! Setting up your ${selectedRole} account...`)
      
      // Redirect to appropriate onboarding
      if (selectedRole === 'company') {
        router.push('/company/onboarding')
      } else {
        router.push('/freelancer/onboarding')
      }
    } catch (error) {
      console.error('Error setting role:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to set role')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 pb-28">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              I want to...
            </h1>
            <p className="text-gray-600">Choose what best describes you</p>
          </div>

          {/* Role Options - Compact Design */}
          <div className="space-y-3">
            {/* Company Option */}
            <button
            onClick={() => selectRole('company')}
            disabled={loading}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'company'
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
            } ${loading && selectedRole !== 'company' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                  Hire Talent
                </h3>
                <p className="text-sm text-gray-600 leading-snug">
                  Post jobs, browse photographers/videographers, and manage bookings
                </p>
              </div>

            </div>
            </button>

            {/* Freelancer Option */}
            <button
            onClick={() => selectRole('freelancer')}
            disabled={loading}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === 'freelancer'
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:scale-[1.01]'
            } ${loading && selectedRole !== 'freelancer' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                  Find Gigs
                </h3>
                <p className="text-sm text-gray-600 leading-snug">
                  Browse photography/videography jobs, showcase work, and get hired
                </p>
              </div>

            </div>
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-500 mt-6">
            You&apos;ll complete your profile in the next step
          </p>
        </div>
      </div>

      {/* Sticky Continue Button - Only show when role is selected */}
      {selectedRole && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleContinue}
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
