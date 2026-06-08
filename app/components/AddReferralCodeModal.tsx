'use client'

import { useState } from 'react'

interface AddReferralCodeModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddReferralCodeModal({ onClose, onSuccess }: AddReferralCodeModalProps) {
  const [referralCode, setReferralCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!referralCode.trim()) {
      setError('Please enter your Strategic Partner Referral Code')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/update-referral-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: referralCode.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || 'Failed to update Strategic Partner Referral Code')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    // Close modal but don't mark as completed - will show again next login
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your Strategic Partner Referral Code</h2>
          <p className="text-gray-600">
            You received this code when you completed wallet activation with MOSCA
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
              Strategic Partner Referral Code *
            </label>
            <input
              type="text"
              id="referralCode"
              required
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent font-mono text-lg"
              placeholder="Enter your Strategic Partner Referral Code"
              autoFocus
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Where to find it:</strong> Check your MOSCA wallet activation confirmation email or dashboard.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold rounded-lg"
            >
              {isSubmitting ? 'Saving...' : 'Save Code'}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can also add this later in your Profile Settings
        </p>
      </div>
    </div>
  )
}
