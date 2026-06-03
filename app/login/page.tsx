'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOnSubdomain, setIsOnSubdomain] = useState(false)

  useEffect(() => {
    // Check if we're on a subdomain (not hub.citizenactivation.com)
    const hostname = window.location.hostname
    const isSubdomain = hostname.includes('.') && !hostname.startsWith('hub.') && !hostname.includes('localhost')
    setIsOnSubdomain(isSubdomain)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        // If on subdomain, redirect to hub for dashboard
        if (isOnSubdomain) {
          window.location.href = 'https://hub.citizenactivation.com/dashboard'
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Branded Container with Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/citizen-activation-logo.jpg"
                alt="Citizen Activation System Logo"
                width={300}
                height={120}
                priority
                className="object-contain"
              />
            </div>
            <p className="text-gray-600 mt-2">Strategic Partner Hub</p>
          </div>

          {/* Login Form */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
            />
          </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center">
              <div>
                <a href="/forgot-password" className="text-[#1E8E5A] hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div>
                <a href="/" className="text-gray-600 hover:underline text-sm">
                  ← Back to Request Form
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
