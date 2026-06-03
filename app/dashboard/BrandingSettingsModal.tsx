'use client'

import { useState } from 'react'

interface BrandingSettingsModalProps {
  team: any
  onClose: () => void
  onSuccess: () => void
}

export default function BrandingSettingsModal({ team, onClose, onSuccess }: BrandingSettingsModalProps) {
  const [formData, setFormData] = useState({
    organizationName: team.organizationName || team.name || '',
    welcomeMessage: team.welcomeMessage || '',
    primaryColor: team.primaryColor || '#1E8E5A',
    secondaryColor: team.secondaryColor || '#065F46',
    emailFromName: team.emailFromName || '',
    hidePlatformBranding: team.hidePlatformBranding || false
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(team.logoUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
      setError('Logo must be PNG, JPG, or SVG')
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB')
      return
    }

    setLogoFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      let logoUrl = team.logoUrl

      // Upload logo if new file selected
      if (logoFile) {
        const logoFormData = new FormData()
        logoFormData.append('logo', logoFile)

        const uploadResponse = await fetch('/api/branding/upload-logo', {
          method: 'POST',
          body: logoFormData
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || 'Failed to upload logo')
        }

        const uploadData = await uploadResponse.json()
        logoUrl = uploadData.url
      }

      // Update branding
      const response = await fetch('/api/branding/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          logoUrl
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update branding')
      }

      alert('✅ Branding updated successfully!')
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to update branding')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎨 Branding Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Customize your organization's appearance</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {logoPreview ? (
                    <div>
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="max-h-24 mx-auto mb-3 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null)
                          setLogoFile(null)
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <label className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload logo
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        <span className="text-xs text-gray-500">PNG, JPG, SVG up to 2MB</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Name */}
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  id="organizationName"
                  required
                  maxLength={100}
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Grace Church"
                />
                <p className="text-xs text-gray-500 mt-1">Replaces platform name everywhere</p>
              </div>

              {/* Welcome Message */}
              <div>
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  id="welcomeMessage"
                  rows={3}
                  maxLength={500}
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Welcome to our Private Invitation system. Join our community today!"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.welcomeMessage.length}/500 characters
                </p>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-16 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="#1E8E5A"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Buttons & headers</p>
                </div>

                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-16 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="#065F46"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Accents & links</p>
                </div>
              </div>

              {/* Email From Name */}
              <div>
                <label htmlFor="emailFromName" className="block text-sm font-medium text-gray-700 mb-2">
                  Email From Name
                </label>
                <input
                  type="text"
                  id="emailFromName"
                  maxLength={100}
                  value={formData.emailFromName}
                  onChange={(e) => setFormData({ ...formData, emailFromName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Grace Church Activation Team"
                />
                <p className="text-xs text-gray-500 mt-1">Sender name for emails</p>
              </div>

              {/* Hide Platform Branding */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="hidePlatformBranding"
                  checked={formData.hidePlatformBranding}
                  onChange={(e) => setFormData({ ...formData, hidePlatformBranding: e.target.checked })}
                  className="mt-1 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="hidePlatformBranding" className="ml-3 block text-sm text-gray-700">
                  Hide "Powered by CitizenActivation.com" footer
                  <p className="text-xs text-gray-500 mt-1">Remove platform branding from subdomain pages</p>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
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
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold rounded-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Save Branding'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              {/* Preview Header */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center gap-3">
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo" className="h-10 object-contain" />
                  )}
                  <div>
                    <div className="font-bold text-lg text-gray-900">
                      {formData.organizationName || 'Organization Name'}
                    </div>
                    <div className="text-xs text-gray-600">Organization Admin Dashboard</div>
                  </div>
                </div>
              </div>

              {/* Preview Welcome Message */}
              {formData.welcomeMessage && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <p className="text-sm text-gray-700 italic">
                    "{formData.welcomeMessage}"
                  </p>
                </div>
              )}

              {/* Preview Button */}
              <button
                type="button"
                style={{ backgroundColor: formData.primaryColor }}
                className="w-full py-3 text-white font-semibold rounded-lg mb-4"
              >
                Request Invitation
              </button>

              {/* Preview Link */}
              <a
                href="#"
                style={{ color: formData.secondaryColor }}
                className="text-sm font-medium block mb-4"
                onClick={(e) => e.preventDefault()}
              >
                View Strategic Partners
              </a>

              {/* Preview Footer */}
              {!formData.hidePlatformBranding && (
                <div className="text-xs text-gray-500 text-center pt-4 border-t">
                  Powered by CitizenActivation.com
                </div>
              )}
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-blue-900 mb-1">💡 Tip</div>
              <p className="text-xs text-blue-800">
                Your branding will appear on your subdomain pages, dashboard, and emails sent to your network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
