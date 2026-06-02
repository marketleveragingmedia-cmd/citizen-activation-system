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
    requesterPhone: '',
    referralCode: '',
    activationLevel: 'Citizen'
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
          requesterFirstName: formData.requesterFirstName,
          requesterLastName: formData.requesterLastName,
          requesterEmail: formData.requesterEmail,
          requesterPhone: formData.requesterPhone,
          referralCode: formData.referralCode || undefined,
          subdomain,
          activationLevel: formData.activationLevel
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <div 
            className="text-white p-8 rounded-lg mb-6"
            style={{ backgroundColor: primaryColor }}
          >
            <h1 className="text-4xl font-bold mb-4">✓ Request Received!</h1>
            <p className="text-xl">Thank you for your MOSCA invitation request.</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg text-left">
            <h2 className="text-2xl font-bold mb-4">What Happens Next:</h2>
            <ol className="space-y-3 text-lg">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Your assigned Strategic Partner will contact you within 24-48 hours to Confirm Your Details and schedule your Onboarding Session</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>You'll receive your official MOSCA Invitation</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Join the MOSCA Community as an Activated Member</span>
              </li>
            </ol>
            <p className="mt-6 text-gray-600">Check your email for confirmation details.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              required
              value={formData.requesterFirstName}
              onChange={(e) => setFormData({ ...formData, requesterFirstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': primaryColor 
              } as React.CSSProperties}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              required
              value={formData.requesterLastName}
              onChange={(e) => setFormData({ ...formData, requesterLastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ 
                '--tw-ring-color': primaryColor 
              } as React.CSSProperties}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.requesterEmail}
            onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ 
              '--tw-ring-color': primaryColor 
            } as React.CSSProperties}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.requesterPhone}
            onChange={(e) => setFormData({ ...formData, requesterPhone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ 
              '--tw-ring-color': primaryColor 
            } as React.CSSProperties}
          />
        </div>

        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
            Strategic Partner Referral Code (Optional)
          </label>
          <input
            type="text"
            id="referralCode"
            value={formData.referralCode}
            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            style={{ 
              '--tw-ring-color': primaryColor 
            } as React.CSSProperties}
            placeholder="Enter code if you were referred by a Strategic Partner"
          />
          <p className="mt-2 text-sm text-gray-500">
            If you have a referral code from an activated Strategic Partner, enter it here.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Activation Level *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label 
              className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer
                ${formData.activationLevel === 'Citizen' 
                  ? 'bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'}
              `}
              style={formData.activationLevel === 'Citizen' ? { borderColor: primaryColor } : {}}
            >
              <input
                type="radio"
                name="activationLevel"
                value="Citizen"
                checked={formData.activationLevel === 'Citizen'}
                onChange={(e) => setFormData({ ...formData, activationLevel: e.target.value })}
                className="mr-3"
              />
              <div>
                <div className="font-bold text-lg">Citizen</div>
                <div className="text-gray-600">$225</div>
              </div>
            </label>

            <label 
              className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer
                ${formData.activationLevel === 'Enterprise' 
                  ? 'bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'}
              `}
              style={formData.activationLevel === 'Enterprise' ? { borderColor: primaryColor } : {}}
            >
              <input
                type="radio"
                name="activationLevel"
                value="Enterprise"
                checked={formData.activationLevel === 'Enterprise'}
                onChange={(e) => setFormData({ ...formData, activationLevel: e.target.value })}
                className="mr-3"
              />
              <div>
                <div className="font-bold text-lg">Enterprise</div>
                <div className="text-gray-600">$525</div>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:bg-gray-400"
          style={{ 
            backgroundColor: isSubmitting ? '#9ca3af' : primaryColor,
            ':hover': { opacity: 0.9 }
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Request Private Invitation'}
        </button>

        <p className="text-sm text-gray-500 text-center max-w-md mx-auto">
          By submitting, you'll be assigned to a Strategic Partner who will guide you through the Activation Process.
        </p>
      </form>
    </>
  )
}
