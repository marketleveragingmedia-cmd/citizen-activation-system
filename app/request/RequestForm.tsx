'use client'

import { useState } from 'react'

interface RequestFormProps {
  subdomain: string
  primaryColor: string
  secondaryColor: string
}

export default function RequestForm({ subdomain, primaryColor, secondaryColor }: RequestFormProps) {
  const [formData, setFormData] = useState({
    requesterFirstName: '',
    requesterLastName: '',
    requesterEmail: '',
    requesterPhone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/request/route-by-subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subdomain,
          activationLevel: 'Citizen'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: primaryColor + '20' }}
          >
            <svg 
              className="w-12 h-12" 
              style={{ color: primaryColor }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Request Submitted Successfully!
        </h3>
        <p className="text-gray-700 mb-2">
          Thank you for your interest in MOSCA wallet.
        </p>
        <p className="text-gray-600 text-sm">
          A Strategic Partner will contact you soon to begin the invitation process.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Submit Another Request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="requesterFirstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="requesterFirstName"
            required
            value={formData.requesterFirstName}
            onChange={(e) => setFormData({ ...formData, requesterFirstName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ 
              '--tw-ring-color': primaryColor 
            } as React.CSSProperties}
            placeholder="John"
          />
        </div>

        <div>
          <label htmlFor="requesterLastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="requesterLastName"
            required
            value={formData.requesterLastName}
            onChange={(e) => setFormData({ ...formData, requesterLastName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ 
              '--tw-ring-color': primaryColor 
            } as React.CSSProperties}
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="requesterEmail" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="requesterEmail"
          required
          value={formData.requesterEmail}
          onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
          style={{ 
            '--tw-ring-color': primaryColor 
          } as React.CSSProperties}
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label htmlFor="requesterPhone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          id="requesterPhone"
          required
          value={formData.requesterPhone}
          onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
          style={{ 
            '--tw-ring-color': primaryColor 
          } as React.CSSProperties}
          placeholder="+1 (555) 123-4567"
        />
        <p className="text-xs text-gray-500 mt-1">
          Include country code (e.g., +1 for USA)
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          style={{ backgroundColor: primaryColor }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>
          By submitting, you agree to be contacted by a Strategic Partner regarding your MOSCA wallet invitation.
        </p>
      </div>
    </form>
  )
}
