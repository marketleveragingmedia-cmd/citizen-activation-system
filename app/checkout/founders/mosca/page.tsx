'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function FoundersMoscaCheckout() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    moscaCode: '',
    subdomainOption1: '',
    subdomainOption2: '',
    walletInfo: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [subdomain1Status, setSubdomain1Status] = useState<any>({ checking: false, valid: null, error: null, warning: null })
  const [subdomain2Status, setSubdomain2Status] = useState<any>({ checking: false, valid: null, error: null, warning: null })

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
      setSubdomain1Status((prev: any) => ({ ...prev, checking: true }))
    } else {
      setSubdomain2Status((prev: any) => ({ ...prev, checking: true }))
    }

    try {
      const response = await fetch('/api/subdomain/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain })
      })
      const data = await response.json()

      if (option === 1) {
        setSubdomain1Status({ checking: false, valid: data.valid, error: data.error, warning: data.warning })
        if (data.valid && data.subdomain !== subdomain) {
          setFormData(prev => ({ ...prev, subdomainOption1: data.subdomain }))
        }
      } else {
        setSubdomain2Status({ checking: false, valid: data.valid, error: data.error, warning: data.warning })
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
      if (formData.subdomainOption1) validateSubdomain(formData.subdomainOption1, 1)
    }, 500)
    return () => clearTimeout(timer)
  }, [formData.subdomainOption1])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.subdomainOption2) validateSubdomain(formData.subdomainOption2, 2)
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
      const response = await fetch('/api/checkout/founders/mosca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      router.push('/checkout/founders/mosca/pending')
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
            <Image src="/founder-badge.png" alt="Founders Logo" width={280} height={280} priority />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Founders Beta Launch</h1>
          <p className="text-xl text-[#1E8E5A] font-semibold mb-4">$997 One-Time • Lifetime Access • Zero Annual Fees</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900"><strong>🔗 MOSCA Wallet Payment</strong> - Manual verification within 24-48 hours</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-3">Payment Instructions:</h3>
          <ol className="space-y-2 text-sm text-blue-900">
            <li><strong>1.</strong> Send $997 (or equivalent) to: <span className="font-mono bg-white px-2 py-1 rounded">mzsamantha01@gmail.com</span></li>
            <li><strong>2.</strong> Complete the form below with your transaction details</li>
            <li><strong>3.</strong> We'll verify payment and activate your account within 24-48 hours</li>
          </ol>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A]" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A]" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">MOSCA Verification</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">MOSCA Strategic Partner Referral Code *</label>
            <input type="text" required value={formData.moscaCode} onChange={(e) => setFormData({ ...formData, moscaCode: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] font-mono text-lg" placeholder="Enter your MOSCA code" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address / Transaction ID / Confirmation Details *</label>
            <textarea required value={formData.walletInfo} onChange={(e) => setFormData({ ...formData, walletInfo: e.target.value })} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] font-mono" placeholder="Enter your wallet address, transaction ID, or any confirmation details from your MOSCA payment" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Custom Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Choice *</label>
                <div className="flex items-center gap-2">
                  <input type="text" required value={formData.subdomainOption1} onChange={(e) => setFormData({ ...formData, subdomainOption1: e.target.value.toLowerCase() })} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A]" placeholder="yourname" />
                  <span className="text-gray-600">.citizenactivation.com</span>
                </div>
                {subdomain1Status.checking && <p className="text-sm text-gray-500 mt-1">Checking...</p>}
                {subdomain1Status.valid && <p className="text-sm text-green-600 mt-1">✓ Available</p>}
                {subdomain1Status.error && <p className="text-sm text-red-600 mt-1">{subdomain1Status.error}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Choice *</label>
                <div className="flex items-center gap-2">
                  <input type="text" required value={formData.subdomainOption2} onChange={(e) => setFormData({ ...formData, subdomainOption2: e.target.value.toLowerCase() })} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A]" placeholder="alternate-name" />
                  <span className="text-gray-600">.citizenactivation.com</span>
                </div>
                {subdomain2Status.checking && <p className="text-sm text-gray-500 mt-1">Checking...</p>}
                {subdomain2Status.valid && <p className="text-sm text-green-600 mt-1">✓ Available</p>}
                {subdomain2Status.error && <p className="text-sm text-red-600 mt-1">{subdomain2Status.error}</p>}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <button type="submit" disabled={loading} className="w-full bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors">
              {loading ? 'Submitting...' : '🔗 Submit MOSCA Payment Application'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-2">Questions? Email <a href="mailto:support@citizenactivation.com" className="text-[#1E8E5A] hover:underline">support@citizenactivation.com</a></p>
          </div>
        </form>
      </div>
    </div>
  )
}
