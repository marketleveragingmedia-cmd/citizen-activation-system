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
    organizationName: '',
    moscaReferralCode: ''
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
        organizationName: '',
        moscaReferralCode: ''
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
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
            
            <div className="bg-white p-4 rounded border border-green-300 mb-4">
              <p className="font-semibold text-gray-900 mb-2">Login Credentials:</p>
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
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded border border-yellow-300 text-sm">
              <p className="font-semibold text-yellow-800 mb-1">⚠️ Important:</p>
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
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {formData.accountType === 'MAIN_ADMIN' && 'Full network control, can add Team Admins & Org Admins'}
              {formData.accountType === 'TEAM_ADMIN' && 'Manage Strategic Partners & Requests'}
              {formData.accountType === 'ORG_ADMIN' && 'Organization branding, sees only their network'}
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

          {/* MOSCA Referral Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              MOSCA Referral Code *
            </label>
            <input
              type="text"
              name="moscaReferralCode"
              value={formData.moscaReferralCode}
              onChange={handleChange}
              placeholder="Enter MOSCA Referral Code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Required - Confirms they are an activated Strategic Partner in MOSCA
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
