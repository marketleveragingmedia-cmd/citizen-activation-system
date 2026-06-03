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
      setError('Referral Code is required')
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
        setError(data.error || 'Failed to update Referral Code')
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome! 🎉
          </h2>
          <p className="text-gray-600">
            Your wallet has been activated and you're now a Strategic Partner!
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Required: Add Your Referral Code</h3>
          <p className="text-sm text-blue-800">
            Please enter your Referral Code to complete your profile setup.
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
              Referral Code *
            </label>
            <input
              type="text"
              id="referralCode"
              required
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
              placeholder="Enter your Referral Code"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-2">
              This code confirms you are an completed wallet activation.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg"
            >
              {isSubmitting ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>This is required before you can use your dashboard.</p>
        </div>
      </div>
    </div>
  )
}
