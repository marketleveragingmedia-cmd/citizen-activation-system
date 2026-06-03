'use client'

import { useState } from 'react'

interface StripeConnectButtonProps {
  hasStripeAccount: boolean
  stripeAccountId?: string
}

export default function StripeConnectButton({ hasStripeAccount, stripeAccountId }: StripeConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()

      if (response.ok && data.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl
      } else {
        setError(data.error || 'Failed to create Stripe account')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (hasStripeAccount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-xl">✓</span>
          <div>
            <div className="font-semibold text-green-800">Stripe Connected</div>
            <div className="text-sm text-green-700">
              You'll receive $200 per Team Admin and $297/$200 per Organization Admin added to your system
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="mb-3">
        <div className="font-semibold text-yellow-800 mb-1">Connect Stripe to Receive Payments</div>
        <div className="text-sm text-yellow-700 space-y-2">
          <p>
            When you add <strong>Team Admins</strong> ($497/year each), you'll automatically receive <strong>$200</strong> and we'll handle the platform fee ($297).
          </p>
          <p>
            When you add <strong>Organization Admins</strong> ($997 Year 1), you'll automatically receive <strong>$297</strong> and we'll handle the platform fee ($700).
          </p>
          <p>
            You will automatically receive <strong>$200</strong> year 2+ and we'll handle the platform fee ($297) when the Organization Admin renews at $497/yr.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-[#635BFF] hover:bg-[#5248E6] disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            Connecting...
          </>
        ) : (
          <>
            <span>🔗</span>
            Connect Stripe Account
          </>
        )}
      </button>
    </div>
  )
}
