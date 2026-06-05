'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)

  const [formData, setFormData] = useState({
    accountType: 'MAIN_ADMIN',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    subdomain: '',
    organizationName: '',
    referralCode: ''
  })

  const [subdomainStatus, setSubdomainStatus] = useState<{
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/create-account-no-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      setSuccess(data)
      
      // Reset form
      setFormData({
        accountType: 'MAIN_ADMIN',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        subdomain: '',
        organizationName: '',
        referralCode: ''
      })
      setSubdomainStatus({
        checking: false,
        valid: null,
        error: null,
        warning: null
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Real-time subdomain validation
    if (name === 'subdomain') {
      validateSubdomain(value)
    }
  }

  const validateSubdomain = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus({
        checking: false,
        valid: null,
        error: null,
        warning: null
      })
      return
    }

    setSubdomainStatus(prev => ({ ...prev, checking: true }))

    try {
      const response = await fetch('/api/subdomain/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain })
      })

      const data = await response.json()

      setSubdomainStatus({
        checking: false,
        valid: data.valid,
        error: data.error,
        warning: data.warning
      })

      // Update form with cleaned subdomain if valid
      if (data.valid && data.subdomain !== subdomain) {
        setFormData(prev => ({ ...prev, subdomain: data.subdomain }))
      }
    } catch (err) {
      setSubdomainStatus({
        checking: false,
        valid: false,
        error: 'Failed to validate subdomain',
        warning: null
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Account (No Payment)
          </h1>
          <p className="text-gray-600 mt-2">
            Master Admin: Add accounts directly without payment processing
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-bold text-lg mb-4">
              ✅ Account Created Successfully!
            </p>

            {/* SSL PROVISIONING WARNING - PROMINENT */}
            {success.account.subdomain && (
              <div className="bg-orange-100 border-4 border-orange-500 p-5 rounded-lg mb-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">⏱️</div>
                  <div className="flex-1">
                    <p className="font-bold text-orange-900 text-xl mb-2">
                      🔐 WAIT UP TO 30 MINUTES BEFORE ACCESSING SUBDOMAIN
                    </p>
                    <p className="text-orange-800 font-semibold text-base leading-relaxed">
                      The subdomain URL <span className="font-mono bg-white px-2 py-1 rounded">{success.account.subdomain}.citizenactivation.com</span> needs time to provision SSL certificates.
                    </p>
                    <p className="text-orange-800 font-semibold text-base mt-2 leading-relaxed">
                      ⚠️ If you see an SSL error or "connection not secure" warning, <strong>WAIT UP TO 30 MINUTES</strong> and refresh the page. This is normal for new subdomains.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white p-4 rounded border border-green-300 mb-4">
              <p className="font-semibold text-gray-900 mb-2">Account Details:</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {success.credentials.email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Temporary Password:</span>{' '}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {success.credentials.temporaryPassword}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>{' '}
                  <span className="font-semibold">{success.account.role}</span>
                </div>
                {success.account.subdomain && (
                  <div>
                    <span className="text-gray-600">Subdomain:</span>{' '}
                    <a 
                      href={success.account.subdomainUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono bg-blue-50 px-2 py-1 rounded text-blue-600 hover:text-blue-800 underline"
                    >
                      {success.account.subdomain}.citizenactivation.com
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded border border-yellow-300 text-sm">
              <p className="font-semibold text-yellow-800 mb-1">⚠️ Security Reminders:</p>
              <ul className="text-yellow-700 space-y-1 ml-4 list-disc">
                <li>User must change password on first login</li>
                <li>Send these credentials securely to the user</li>
                <li>Credentials will not be shown again</li>
              </ul>
            </div>

            <a
              href={success.credentials.loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800 underline"
            >
              Open Login Page →
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Account Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Type *
            </label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="MAIN_ADMIN">Main Admin ($1,497 → $997/year)</option>
              <option value="TEAM_ADMIN">Team Admin Direct ($497/year)</option>
              <option value="ORG_ADMIN">Organization Admin ($997 → $497/year)</option>
              <option value="FOUNDER">Founder (Lifetime Access - $997 one-time)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {formData.accountType === 'MAIN_ADMIN' && 'Full network control, can add Team Admins & Org Admins'}
              {formData.accountType === 'TEAM_ADMIN' && 'Manage Strategic Partners & Requests'}
              {formData.accountType === 'ORG_ADMIN' && 'Organization branding, sees only their network'}
              {formData.accountType === 'FOUNDER' && '⭐ Founder Badge • Lifetime Access • Zero Annual Fees'}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Smith"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Subdomain */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subdomain *
            </label>
            <div className="flex items-center">
              <input
                type="text"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                placeholder="john"
                className={`w-full px-4 py-2 border rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  subdomainStatus.valid === false ? 'border-red-300' :
                  subdomainStatus.valid === true ? 'border-green-300' :
                  'border-gray-300'
                }`}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
              />
              <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 whitespace-nowrap">
                .citizenactivation.com
              </span>
            </div>
            
            {subdomainStatus.checking && (
              <p className="text-sm text-blue-600 mt-1">⏳ Checking availability...</p>
            )}
            
            {subdomainStatus.error && (
              <p className="text-sm text-red-600 mt-1">❌ {subdomainStatus.error}</p>
            )}
            
            {subdomainStatus.valid && (
              <p className="text-sm text-green-600 mt-1">✅ Subdomain available!</p>
            )}
            
            {subdomainStatus.warning && (
              <p className="text-sm text-yellow-600 mt-1">{subdomainStatus.warning}</p>
            )}
            
            <p className="text-sm text-gray-500 mt-1">
              3-20 characters, lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Referral Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Strategic Partner Referral Code *
            </label>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Your Strategic Partner Referral Code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Required - Confirms they have an activated wallet
            </p>
          </div>

          {/* Organization Name (conditional) */}
          {(formData.accountType === 'MAIN_ADMIN' || formData.accountType === 'ORG_ADMIN') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.accountType === 'MAIN_ADMIN' ? 'Network Name' : 'Organization Name'}
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder={formData.accountType === 'MAIN_ADMIN' 
                  ? "John's Business Network" 
                  : "Community Organization Name"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Optional - defaults to &quot;{formData.firstName} {formData.lastName}&apos;s {formData.accountType === 'MAIN_ADMIN' ? 'Network' : 'Organization'}&quot;
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">📋 What happens next:</p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
            <li>Account is created immediately (no payment required)</li>
            <li>Temporary password is generated automatically</li>
            <li>You receive credentials to share with the user</li>
            <li>User logs in and changes password on first access</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
