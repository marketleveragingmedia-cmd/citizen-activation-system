'use client'

import { useState } from 'react'

interface EditPartnerReferralCodeModalProps {
  partnerId: string
  partnerName: string
  currentReferralCode: string
  onClose: () => void
  onSuccess: () => void
}

export default function EditPartnerReferralCodeModal({ 
  partnerId, 
  partnerName, 
  currentReferralCode, 
  onClose, 
  onSuccess 
}: EditPartnerReferralCodeModalProps) {
  const [referralCode, setReferralCode] = useState(currentReferralCode || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!referralCode.trim()) {
      setError('Strategic Partner Referral Code cannot be empty')
      return
    }

    if (!confirm(`Update ${partnerName}'s Strategic Partner Referral Code to: ${referralCode.trim()}?`)) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/master-admin/update-partner-referral-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          partnerId,
          referralCode: referralCode.trim() 
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Strategic Partner Referral Code updated successfully')
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Strategic Partner Referral Code</h2>
            <p className="text-sm text-gray-600 mt-1">Strategic Partner: {partnerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
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
              placeholder="Strategic Partner Referral Code from MOSCA"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-1">
              This should match their MOSCA wallet activation code
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Master Admin Override:</strong> Only update this if the Strategic Partner provided an incorrect code or needs correction.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold rounded-lg"
            >
              {isSubmitting ? 'Updating...' : 'Update Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
