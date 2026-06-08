'use client'

import { signOut } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut({ callbackUrl: '/login' })
  }

  const handleCancel = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
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

          {/* Sign Out Confirmation */}
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Sign Out?
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to sign out of your account?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isSigningOut ? 'Signing out...' : 'Yes, Sign Out'}
              </button>

              <button
                onClick={handleCancel}
                disabled={isSigningOut}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
