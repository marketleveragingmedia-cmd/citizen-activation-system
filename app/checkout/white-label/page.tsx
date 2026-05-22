'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WhiteLabelCheckout() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState<'promo' | 'regular'>('promo')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/checkout/white-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, tier })
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E8E5A] mb-2">
            White-Label System
          </h1>
          <p className="text-gray-600">
            Your own independent system with full control
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div 
            onClick={() => setTier('promo')}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              tier === 'promo' 
                ? 'border-[#1E8E5A] bg-green-50' 
                : 'border-gray-300 hover:border-[#1E8E5A]'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="inline-block bg-[#C9A441] text-white px-2 py-1 rounded text-xs font-semibold mb-2">
                  PROMOTIONAL
                </div>
                <h2 className="text-2xl font-bold text-gray-900">White-Label (Promo)</h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#1E8E5A]">$1,997</div>
                <div className="text-sm text-gray-600">Year 1</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Year 1:</strong> $1,997 | <strong>Year 2+:</strong> $497/year
            </div>
          </div>

          <div 
            onClick={() => setTier('regular')}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              tier === 'regular' 
                ? 'border-[#1E8E5A] bg-green-50' 
                : 'border-gray-300 hover:border-[#1E8E5A]'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">White-Label (Regular)</h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#1E8E5A]">$2,997</div>
                <div className="text-sm text-gray-600">Year 1</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Year 1:</strong> $2,997 | <strong>Year 2+:</strong> $497/year
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">What's Included:</h3>
          <div className="space-y-2 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Your own separate system</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Full independence & control</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Own domain/subdomain</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Main Admin access</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>Unlimited Team Admins</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#1E8E5A] mt-1">✓</span>
              <span>White-label branding</span>
            </div>
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
            {loading ? 'Processing...' : `Get White-Label - $${tier === 'promo' ? '1,997' : '2,997'}`}
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
