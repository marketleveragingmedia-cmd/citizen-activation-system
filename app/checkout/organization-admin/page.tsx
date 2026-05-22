'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrganizationAdminCheckout() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/checkout/organization-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email })
      })

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session')
        setLoading(false)
      }
    } catch (error) {
      alert('Error creating checkout')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E8E5A] to-[#155d3a] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="text-center mb-6">
          <div className="inline-block bg-[#C9A441] text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">
            POPULAR
          </div>
          <h1 className="text-2xl font-bold text-[#1E8E5A] mb-2">
            Organization Admin
          </h1>
          <p className="text-gray-600">
            Dedicated branding for your organization
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Organization Admin</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#1E8E5A]">$997</div>
              <div className="text-sm text-gray-600">Year 1</div>
            </div>
          </div>

          <div className="space-y-2 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Everything In Team Admin</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Dedicated Branding (Custom Logo)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Custom Subdomain (Optional)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Single Organization Focus</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Enhanced Features</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t text-sm text-gray-600">
            <strong>Year 1:</strong> $997 | <strong>Year 2+:</strong> $497/year
          </div>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1E8E5A] text-white font-semibold rounded-lg hover:bg-[#155d3a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Get Organization Admin - $997'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          All payments are secure and processed through Stripe.<br />
          Year 2+ renewals are automatic at $497/year.
        </p>
      </div>
    </div>
  )
}
