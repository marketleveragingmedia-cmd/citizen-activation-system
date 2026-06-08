'use client'

import { useState } from 'react'

interface ReferralCodeModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function ReferralCodeModal({ onClose, onSuccess }: ReferralCodeModalProps) {
  const [referralCode, setReferralCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!referralCode.trim()) {
      setError('Strategic Partner Referral Code is required')
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Add Your Strategic Partner Referral Code
          </h2>
          <p className="text-gray-600">
            You received this code when you completed wallet activation with MOSCA
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="referralCode" className="block text-sm font-semibold text-gray-700 mb-2">
              Strategic Partner Referral Code *
            </label>
            <input
              type="text"
              id="referralCode"
              required
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
              placeholder="Your Strategic Partner Referral Code"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-2">
              Check your MOSCA wallet activation confirmation email or dashboard
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold rounded-lg"
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>You can also add this later in your Profile Settings</p>
        </div>
      </div>
    </div>
  )
}
