'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function FoundersStripeSuccess() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      setError('No session ID found')
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Processing...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/founder-badge.png"
              alt="Founders Badge"
              width={120}
              height={120}
              priority
            />
          </div>
          <div className="mb-6">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, Founder!
            </h1>
            <p className="text-xl text-[#1E8E5A] font-semibold">
              Your payment was successful
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-bold text-green-900 text-lg mb-4">What happens next?</h3>
            <ul className="space-y-3 text-green-900">
              <li className="flex items-start">
                <span className="text-xl mr-3">✉️</span>
                <span><strong>Welcome email sent</strong> - Check your inbox for login credentials and account details</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">🔗</span>
                <span><strong>Your custom link is ready</strong> - You can start sharing it with your network immediately</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">⭐</span>
                <span><strong>Founder status activated</strong> - Lifetime access with zero annual fees</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">🚀</span>
                <span><strong>Priority support</strong> - Email support@citizenactivation.com anytime</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="block w-full bg-[#1E8E5A] hover:bg-[#177349] text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Return to Home
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t">
            <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-2">
              If you didn't receive the welcome email within 10 minutes, please check your spam folder.
            </p>
            <p className="text-gray-600">
              Questions? Email <a href="mailto:support@citizenactivation.com" className="text-[#1E8E5A] hover:underline font-medium">support@citizenactivation.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
