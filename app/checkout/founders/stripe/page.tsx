'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function FoundersStripeCheckout() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    moscaCode: '',
    subdomainOption1: '',
    subdomainOption2: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [subdomain1Status, setSubdomain1Status] = useState<{
    checking: boolean
    valid: boolean | null
    error: string | null
    warning: string | null
  }>({
    checking: false,
    valid: null,
    error: null,
    warning: null
  })
  const [subdomain2Status, setSubdomain2Status] = useState<{
    checking: boolean
    valid: boolean | null
    error: string | null
    warning: string | null
  }>({
    checking: false,
    valid: null,
    error: null,
    warning: null
  })

  const validateSubdomain = async (subdomain: string, option: 1 | 2) => {
    if (!subdomain || subdomain.length < 3) {
      if (option === 1) {
        setSubdomain1Status({ checking: false, valid: null, error: null, warning: null })
      } else {
        setSubdomain2Status({ checking: false, valid: null, error: null, warning: null })
      }
      return
    }

    if (option === 1) {
      setSubdomain1Status(prev => ({ ...prev, checking: true }))
    } else {
      setSubdomain2Status(prev => ({ ...prev, checking: true }))
    }

    try {
      const response = await fetch('/api/subdomain/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain })
      })

      const data = await response.json()

      if (option === 1) {
        setSubdomain1Status({
          checking: false,
          valid: data.valid,
          error: data.error,
          warning: data.warning
        })

        if (data.valid && data.subdomain !== subdomain) {
          setFormData(prev => ({ ...prev, subdomainOption1: data.subdomain }))
        }
      } else {
        setSubdomain2Status({
          checking: false,
          valid: data.valid,
          error: data.error,
          warning: data.warning
        })

        if (data.valid && data.subdomain !== subdomain) {
          setFormData(prev => ({ ...prev, subdomainOption2: data.subdomain }))
        }
      }
    } catch (err) {
      if (option === 1) {
        setSubdomain1Status({ checking: false, valid: false, error: 'Failed to validate', warning: null })
      } else {
        setSubdomain2Status({ checking: false, valid: false, error: 'Failed to validate', warning: null })
      }
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.subdomainOption1) {
        validateSubdomain(formData.subdomainOption1, 1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [formData.subdomainOption1])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.subdomainOption2) {
        validateSubdomain(formData.subdomainOption2, 2)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [formData.subdomainOption2])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.moscaCode) {
      setError('MOSCA Strategic Partner Referral Code is required')
      return
    }

    if (!subdomain1Status.valid && !subdomain2Status.valid) {
      setError('At least one valid subdomain is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/checkout/founders/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/founder-badge.png"
              alt="Founders Logo"
              width={280}
              height={280}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Founders Beta Launch
          </h1>
          <p className="text-xl text-[#1E8E5A] font-semibold mb-4">
            $997 One-Time • Lifetime Access • Zero Annual Fees
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              💳 <strong>Stripe Payment</strong> - Instant automated access upon payment
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* MOSCA Code */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">MOSCA Verification</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-900">
                <strong>⚠️ Required:</strong> You must be a MOSCA Strategic Partner to purchase Founders access.
              </p>
            </div>
            <label htmlFor="moscaCode" className="block text-sm font-medium text-gray-700 mb-2">
              MOSCA Strategic Partner Referral Code *
            </label>
            <input
              type="text"
              id="moscaCode"
              required
              value={formData.moscaCode}
              onChange={(e) => setFormData({ ...formData, moscaCode: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent font-mono text-lg"
              placeholder="Enter your MOSCA code"
            />
          </div>

          {/* Subdomain Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Custom Link</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose two subdomain options (we'll use the first available one automatically)
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="subdomainOption1" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Choice *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="subdomainOption1"
                    required
                    value={formData.subdomainOption1}
                    onChange={(e) => setFormData({ ...formData, subdomainOption1: e.target.value.toLowerCase() })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                    placeholder="yourname"
                  />
                  <span className="text-gray-600">.citizenactivation.com</span>
                </div>
                {subdomain1Status.checking && (
                  <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
                )}
                {subdomain1Status.valid && (
                  <p className="text-sm text-green-600 mt-1">✓ Available</p>
                )}
                {subdomain1Status.error && (
                  <p className="text-sm text-red-600 mt-1">{subdomain1Status.error}</p>
                )}
                {subdomain1Status.warning && (
                  <p className="text-sm text-yellow-600 mt-1">{subdomain1Status.warning}</p>
                )}
              </div>

              <div>
                <label htmlFor="subdomainOption2" className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Choice *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="subdomainOption2"
                    required
                    value={formData.subdomainOption2}
                    onChange={(e) => setFormData({ ...formData, subdomainOption2: e.target.value.toLowerCase() })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                    placeholder="alternate-name"
                  />
                  <span className="text-gray-600">.citizenactivation.com</span>
                </div>
                {subdomain2Status.checking && (
                  <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
                )}
                {subdomain2Status.valid && (
                  <p className="text-sm text-green-600 mt-1">✓ Available</p>
                )}
                {subdomain2Status.error && (
                  <p className="text-sm text-red-600 mt-1">{subdomain2Status.error}</p>
                )}
                {subdomain2Status.warning && (
                  <p className="text-sm text-yellow-600 mt-1">{subdomain2Status.warning}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t">
            <button
              type="submit"
              disabled={loading || subdomain1Status.checking || subdomain2Status.checking}
              className="w-full bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : '💳 Continue to Stripe Payment ($997)'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Secure payment powered by Stripe
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Questions? Email <a href="mailto:support@citizenactivation.com" className="text-[#1E8E5A] hover:underline">support@citizenactivation.com</a>
            </p>
          </div>
        </form>

        {/* Disclosure */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            <strong>Disclosure:</strong> This is a one-time payment of $997 for lifetime access to the Citizen Activation System Founders Beta. 
            There are no recurring charges or annual fees. All sales are final. By proceeding with payment, you acknowledge that you are purchasing 
            a digital product and agree to our terms of service. Your account will be activated immediately upon successful payment. 
            For questions or support, contact <a href="mailto:support@citizenactivation.com" className="text-[#1E8E5A] hover:underline">support@citizenactivation.com</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
