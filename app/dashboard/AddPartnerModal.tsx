'use client'

import { useState } from 'react'

interface AddPartnerModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddPartnerModal({ onClose, onSuccess }: AddPartnerModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    referralCode: '',
    activationLevel: 'Citizen'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/add-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Strategic Partner added successfully!\n\nWelcome email sent to: ${formData.email}\n\nLogin credentials sent via email.`)
        onSuccess()
      } else {
        setError(data.error || 'Failed to add Strategic Partner')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Strategic Partner</h2>
            <p className="text-sm text-gray-600 mt-1">Add an activated Strategic Partner to the Hub</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="John"
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
                placeholder="Doe"
              />
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
              placeholder="john@example.com"
            />
            <p className="text-sm text-gray-500 mt-1">They'll use this to login</p>
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
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
              Strategic Partner Referral Code *
            </label>
            <input
              type="text"
              id="referralCode"
              required
              value={formData.referralCode}
              onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent font-mono"
              placeholder="REF-ABC-123"
            />
            <p className="text-sm text-gray-500 mt-1">
              The referral code issued when they completed wallet activation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Activation Level *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer
                ${formData.activationLevel === 'Citizen' 
                  ? 'border-[#1E8E5A] bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'}
              `}>
                <input
                  type="radio"
                  name="activationLevel"
                  value="Citizen"
                  checked={formData.activationLevel === 'Citizen'}
                  onChange={(e) => setFormData({ ...formData, activationLevel: e.target.value })}
                  className="mr-3"
                />
                <div>
                  <div className="font-bold text-lg">Citizen</div>
                  <div className="text-gray-600">$225</div>
                </div>
              </label>

              <label className={`
                relative flex items-center p-4 border-2 rounded-lg cursor-pointer
                ${formData.activationLevel === 'Enterprise' 
                  ? 'border-[#1E8E5A] bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'}
              `}>
                <input
                  type="radio"
                  name="activationLevel"
                  value="Enterprise"
                  checked={formData.activationLevel === 'Enterprise'}
                  onChange={(e) => setFormData({ ...formData, activationLevel: e.target.value })}
                  className="mr-3"
                />
                <div>
                  <div className="font-bold text-lg">Enterprise</div>
                  <div className="text-gray-600">$525</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What Happens Next:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Strategic Partner account created with 3 available slots</li>
              <li>✓ Temporary password auto-generated</li>
              <li>✓ Welcome email sent with login instructions</li>
              <li>✓ Login credentials sent via email</li>
              <li>✓ They'll be prompted to change password on first login</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold rounded-lg"
            >
              {isSubmitting ? 'Adding...' : 'Add Strategic Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
