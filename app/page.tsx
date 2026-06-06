'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function RequestForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    referralCode: '',
    activationLevel: 'Citizen'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-[#1E8E5A] text-white p-8 rounded-lg mb-6">
            <h1 className="text-4xl font-bold mb-4">✓ Request Received!</h1>
            <p className="text-xl">Thank you for your Private Invitation request.</p>
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
                <span>You'll receive your official Private Invitation</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Join the Platform Community as an Activated Member</span>
              </li>
            </ol>
            <p className="mt-6 text-gray-600">Check your email for confirmation details.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-6 py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/citizen-activation-logo.jpg"
              alt="Citizen Activation System"
              width={320}
              height={125}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Request Private Invitation
          </h1>
          <p className="text-xl text-gray-600">
            Join the Movement. Connect - Activate - Duplicate
          </p>
        </div>

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
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
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
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
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
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
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
              <label className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer
                ${formData.activationLevel === 'Citizen' 
                  ? 'border-[#1E8E5A] bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'}
              `}>
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

              <label className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer
                ${formData.activationLevel === 'Enterprise' 
                  ? 'border-[#1E8E5A] bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'}
              `}>
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
            className="w-full bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Request Private Invitation'}
          </button>

          <p className="text-sm text-gray-500 text-center max-w-md mx-auto">
            By submitting, you'll be assigned to a Strategic Partner who will guide you through the Activation Process.
          </p>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-center">
            Already have an account?<br className="md:hidden" />
            <a href="/login" className="text-[#1E8E5A] font-medium hover:underline ml-1">Login to Strategic Partner Hub</a>
          </p>
        </div>
      </div>
    </div>
  )
}
