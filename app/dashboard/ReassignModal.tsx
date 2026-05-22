'use client'

import { useState, useEffect } from 'react'

interface ReassignModalProps {
  request: any
  onClose: () => void
  onSuccess: () => void
}

export default function ReassignModal({ request, onClose, onSuccess }: ReassignModalProps) {
  const [partners, setPartners] = useState<any[]>([])
  const [selectedPartnerId, setSelectedPartnerId] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch available Strategic Partners
    fetch('/api/get-partners')
      .then(res => res.json())
      .then(data => {
        if (data.partners) {
          // Filter out current partner and show only active partners with slots
          const available = data.partners.filter((p: any) => 
            p.id !== request.assignedPartnerId && 
            p.status === 'Active' && 
            p.slotsUsed < p.slotsAvailable
          )
          setPartners(available)
        }
      })
      .catch(err => console.error('Failed to load partners:', err))
  }, [request.assignedPartnerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPartnerId) {
      setError('Please select a Strategic Partner')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/reassign-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          newPartnerId: selectedPartnerId,
          reason
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Request reassigned successfully!')
        onSuccess()
      } else {
        setError(data.error || 'Failed to reassign request')
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
            <h2 className="text-2xl font-bold text-gray-900">Reassign Request</h2>
            <p className="text-sm text-gray-600 mt-1">
              Requester: <strong>{`${request.requesterFirstName} ${request.requesterLastName}`}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Current: <strong>{`${request.assignedPartner?.firstName || ""} ${request.assignedPartner?.lastName || ""}`.trim() || 'Unassigned'}</strong>
            </p>
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

        {partners.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            No available Strategic Partners with open slots. All partners are either Full or Paused.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select New Strategic Partner *
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {partners.map((partner) => (
                  <label
                    key={partner.id}
                    className={`
                      flex items-center p-3 border rounded-lg cursor-pointer
                      ${selectedPartnerId === partner.id 
                        ? 'border-[#1E8E5A] bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'}
                    `}
                  >
                    <input
                      type="radio"
                      name="partner"
                      value={partner.id}
                      checked={selectedPartnerId === partner.id}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{`${partner.firstName} ${partner.lastName}`}</div>
                      <div className="text-sm text-gray-600">{partner.email}</div>
                      <div className="text-sm text-gray-600">
                        Slots: {partner.slotsUsed}/{partner.slotsAvailable} | 
                        Code: <span className="font-mono">{partner.referralCode}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Reassignment (Optional)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E8E5A] focus:border-transparent"
                placeholder="e.g., Original partner not responding, better skill match, etc."
              />
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
                disabled={isSubmitting || !selectedPartnerId}
                className="px-6 py-3 bg-[#1E8E5A] hover:bg-[#177349] disabled:bg-gray-400 text-white font-bold rounded-lg"
              >
                {isSubmitting ? 'Reassigning...' : 'Reassign Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
