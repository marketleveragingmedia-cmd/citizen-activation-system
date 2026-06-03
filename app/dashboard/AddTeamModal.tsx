'use client'

import { useState } from 'react'

interface AddTeamModalProps {
  onClose: () => void
  onSuccess: () => void
  isMainAdmin?: boolean
  hasStripeAccount?: boolean
  stripeAccountId?: string
}

export default function AddTeamModal({ onClose, onSuccess, isMainAdmin = false, hasStripeAccount = false, stripeAccountId }: AddTeamModalProps) {
  const [formData, setFormData] = useState({
    teamName: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    subdomain: '',
    referralCode: '',
    tierType: 'full-system',
    customDomain: '',
    logoUrl: '',
    wantsCommission: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
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

  const validateSubdomain = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus({ checking: false, valid: null, error: null, warning: null })
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

      if (data.valid && data.subdomain !== subdomain) {
        setFormData(prev => ({ ...prev, subdomain: data.subdomain }))
      }
    } catch (err) {
      setSubdomainStatus({ checking: false, valid: false, error: 'Failed to validate', warning: null })
    }
  }

  const handleConnectStripe = async () => {
    try {
      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (response.ok && data.onboardingUrl) {
        window.location.href = data.onboardingUrl
      } else {
        alert('Failed to create Stripe account')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (isMainAdmin) {
        const response = await fetch('/api/add-team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (response.ok) {
          alert(`Team added successfully!\n\nTeam Admin Login:\nEmail: ${data.team.adminEmail}\nTemporary Password: ${data.team.tempPassword}\n\nWelcome email sent to ${data.team.adminEmail}`)
          onSuccess()
        } else {
          setError(data.error || 'Failed to add team')
        }
        return
      }

      const response = await fetch('/api/create-pending-team-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          wantsCommission: formData.wantsCommission
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Payment link sent!\n\nA payment link has been sent to ${formData.adminEmail}.\n\nOnce they complete payment ($497), their Team Admin account will be activated and you'll ${formData.wantsCommission ? 'receive your $200 payment' : 'forfeit payment (goes to system owner)'}.`)
        onSuccess()
      } else {
        setError(data.error || 'Failed to create Team Admin')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Admin</h2>
            <p className="text-sm text-gray-600 mt-1">Add Team or Organization Admin</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Stripe Connect Section */}
        <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: hasStripeAccount ? '#f0fdf4' : '#fef3c7', borderColor: hasStripeAccount ? '#86efac' : '#fbbf24', borderWidth: '1px'}}>
          {hasStripeAccount ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-600 text-xl">✓</span>
                <div className="font-semibold" style={{color: '#166534'}}>Stripe Connected - Receive Payments</div>
              </div>
              <div className="text-sm" style={{color: '#15803d'}}>
                <p className="mb-2"><strong>Team Admins ($497/year):</strong> You'll receive $200 per signup. We handle the platform fee ($297).</p>
                <p><strong>Organization Admins ($997 Year 1, then $497/year):</strong> You'll receive $297 Year 1, then $200/year after. We handle the platform fee ($700 Year 1, then $297/year).</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-semibold mb-3" style={{color: '#92400e'}}>Connect Stripe to Receive Payments</div>
              <div className="text-sm mb-3" style={{color: '#92400e'}}>
                <p className="mb-2"><strong>Team Admins ($497/year):</strong> You'll automatically receive $200 per signup. We handle the platform fee ($297).</p>
                <p><strong>Organization Admins ($997 Year 1, then $497/year):</strong> You'll automatically receive $297 Year 1, then $200/year after. We handle the platform fee ($700 Year 1, then $297/year).</p>
              </div>
              <button
                onClick={handleConnectStripe}
                type="button"
                className="bg-[#635BFF] hover:bg-[#5248E6] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
              >
                <span>🔗</span>
                Connect Stripe Account
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Admin Type *
            </label>
            <div className={`grid ${isMainAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              <label className={`
                relative flex flex-col p-4 border-2 rounded-lg cursor-pointer
                ${formData.tierType === 'full-system' 
                  ? 'border-[#1E8E5A] bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'}
              `}>
                <input
                  type="radio"
                  name="tierType"
                  value="full-system"
                  checked={formData.tierType === 'full-system'}
                  onChange={(e) => setFormData({ ...formData, tierType: e.target.value })}
                  className="mb-2"
                />
                <div>
                  <div className="font-bold text-lg">Add Team Admin</div>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>✓ Oversee their Team</li>
                    <li>✓ Add Strategic Partners</li>
                    <li>✓ Receive Invite Requests</li>
                  </ul>
                </div>
              </label>

              {isMainAdmin && (
                <label className={`
                  relative flex flex-col p-4 border-2 rounded-lg cursor-pointer
                  ${formData.tierType === 'solo-org' 
                    ? 'border-[#1E8E5A] bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'}
                `}>
                  <input
                    type="radio"
                    name="tierType"
                    value="solo-org"
                    checked={formData.tierType === 'solo-org'}
                    onChange={(e) => setFormData({ ...formData, tierType: e.target.value })}
                    className="mb-2"
                  />
                  <div>
                    <div className="font-bold text-lg">Add Organization Admin</div>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>✓ Oversee their Organization</li>
                      <li>✓ Add Strategic Partners</li>
                      <li>✓ Receive Invite Requests</li>
                    </ul>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Team / Organization Name */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Team / Organization Name</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                  Team/Organization Name *
                </label>
                <input
                  type="text"
                  id="teamName"
                  required
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                  placeholder="e.g., ABC Church, XYZ Corporation"
                />
              </div>
            </div>
          </div>

          {/* Team / Organization Information */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Team / Organization Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adminFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin First Name *
                </label>
                <input
                  type="text"
                  id="adminFirstName"
                  required
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="adminLastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Last Name *
                </label>
                <input
                  type="text"
                  id="adminLastName"
                  required
                  value={formData.adminLastName}
                  onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  required
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="adminPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Phone *
                </label>
                <input
                  type="tel"
                  id="adminPhone"
                  required
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    id="subdomain"
                    required
                    minLength={3}
                    maxLength={20}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    value={formData.subdomain}
                    onChange={(e) => {
                      setFormData({ ...formData, subdomain: e.target.value })
                      validateSubdomain(e.target.value)
                    }}
                    className={`w-full px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent ${
                      subdomainStatus.valid === false ? 'border-red-300' :
                      subdomainStatus.valid === true ? 'border-green-300' :
                      'border-gray-300'
                    }`}
                    placeholder="teamname"
                  />
                  <span className="px-3 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm whitespace-nowrap">
                    .citizenactivation.com
                  </span>
                </div>
                {subdomainStatus.checking && (
                  <p className="text-sm text-blue-600 mt-1">⏳ Checking...</p>
                )}
                {subdomainStatus.error && (
                  <p className="text-sm text-red-600 mt-1">❌ {subdomainStatus.error}</p>
                )}
                {subdomainStatus.valid && (
                  <p className="text-sm text-green-600 mt-1">✅ Available!</p>
                )}
                {subdomainStatus.warning && (
                  <p className="text-sm text-yellow-600 mt-1">{subdomainStatus.warning}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  3-20 characters, lowercase letters, numbers, hyphens only
                </p>
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code *
                </label>
                <input
                  type="text"
                  id="referralCode"
                  required
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                  placeholder="Enter their Referral Code"
                />
                <p className="text-xs text-gray-500 mt-1">Confirms they have completed wallet activation</p>
              </div>
            </div>
          </div>

          {/* Payment Split Choice - Only for Team Admins */}
          {!isMainAdmin && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Preference</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 mb-3">
                  The NEW Team Admin will pay $497 for their access. You can choose to receive payment or forfeit it.
                </p>
                
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                    formData.wantsCommission ? 'border-[#1E8E5A] bg-green-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="commission"
                      checked={formData.wantsCommission}
                      onChange={() => setFormData({ ...formData, wantsCommission: true })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">💰 I want to receive $200 payment</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Requires Stripe Connect. If you don't have Stripe connected yet, you'll be prompted to connect after submitting.
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                    !formData.wantsCommission ? 'border-[#1E8E5A] bg-green-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="commission"
                      checked={!formData.wantsCommission}
                      onChange={() => setFormData({ ...formData, wantsCommission: false })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">🎁 I want to forfeit my payment</div>
                      <div className="text-sm text-gray-600 mt-1">
                        The $200 payment will go to the system owner. You still grow your network.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Branding - Organization Admin Only */}
          {formData.tierType === 'solo-org' && (
            <div className="border-t pt-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-purple-900 mb-2">🎨 Organization Admin Branding</h3>
                <p className="text-sm text-purple-800">
                  Organization Admins get full branding customization for their subdomain. Upload a logo to customize their login page and dashboard.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL *
                  </label>
                  <input
                    type="url"
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                    required={formData.tierType === 'solo-org'}
                  />
                  <p className="text-xs text-gray-500 mt-1">Will be displayed on their subdomain login page and dashboard</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What Happens Next:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ {formData.tierType === 'full-system' ? 'Team Admin' : 'Organization Admin'} account created with auto-generated password</li>
              <li>✓ Welcome email sent with login instructions</li>
              <li>✓ Login credentials sent via email</li>
              <li>✓ Invitation requests automatically assigned to their network</li>
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
              {isSubmitting ? 'Adding Admin...' : 'Add Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
