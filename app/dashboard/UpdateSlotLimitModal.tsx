'use client'

import { useState } from 'react'

interface Props {
  partner: {
    id: string
    firstName: string
    lastName: string
    slotsAvailable: number
    customSlotLimit?: number | null
  }
  onClose: () => void
  onUpdate: () => void
}

export default function UpdateSlotLimitModal({ partner, onClose, onUpdate }: Props) {
  const [customLimit, setCustomLimit] = useState(partner.customSlotLimit?.toString() || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/update-slot-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: partner.id,
          customSlotLimit: customLimit ? parseInt(customLimit) : null
        })
      })

      if (response.ok) {
        onUpdate()
        onClose()
      } else {
        alert('Failed to update slot limit')
      }
    } catch (error) {
      alert('Error updating slot limit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-[#1E8E5A] mb-4">
          Update Slot Limit
        </h2>
        
        <p className="text-sm text-gray-600 mb-4">
          <strong>{partner.firstName} {partner.lastName}</strong>
          <br />
          Current: {partner.customSlotLimit || partner.slotsAvailable} slots
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Slot Limit (leave empty for default 3)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]"
              placeholder="3 (default)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a number to override the default 3-slot limit
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1E8E5A] text-white rounded-lg hover:bg-[#155d3a] disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Limit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
