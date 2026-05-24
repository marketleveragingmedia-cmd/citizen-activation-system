'use client'

import { useState } from 'react'
import Link from 'next/link'
import EditPartnerModal from './EditPartnerModal'

export default function PartnersListClient({ partners, userName }: any) {
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [editingPartner, setEditingPartner] = useState<any>(null)

  const toggleStatus = async (partnerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active'
    
    if (!confirm(`${newStatus === 'Paused' ? 'Pause' : 'Activate'} this Strategic Partner?`)) {
      return
    }

    try {
      const response = await fetch('/api/toggle-partner-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, status: newStatus })
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      alert('Error updating status')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Manage Strategic Partners</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
            <span className="text-gray-600">{userName}</span>
            <Link href="/api/auth/signout" className="text-red-600 hover:underline">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Total Strategic Partners: {partners.length}</h2>
          <p className="text-gray-600">Manage all Strategic Partners who can receive request assignments</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slots</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No Strategic Partners yet. Add one from the dashboard.
                    </td>
                  </tr>
                ) : (
                  partners.map((partner: any) => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPartner(partner)}
                          className="font-medium text-[#1E8E5A] hover:underline"
                        >
                          {`${partner.firstName} ${partner.lastName}`}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{partner.email}</td>
                      <td className="px-6 py-4">
                        <a href={`tel:${partner.phone}`} className="text-[#1E8E5A] hover:underline text-sm">
                          {partner.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {partner.referralCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{partner.activationLevel}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          partner.status === 'Full' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {partner.slotsUsed} / {partner.customSlotLimit ?? partner.slotsAvailable}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          partner.status === 'Active' ? 'bg-green-100 text-green-800' :
                          partner.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setEditingPartner(partner)}
                            className="text-sm text-[#1E8E5A] hover:underline font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(partner.id, partner.status)}
                            className="text-sm text-gray-600 hover:underline font-medium"
                          >
                            {partner.status === 'Active' ? 'Pause' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Strategic Partner Details</h2>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-semibold text-lg">{selectedPartner.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-semibold text-lg">{selectedPartner.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <a href={`mailto:${selectedPartner.email}`} className="text-[#1E8E5A] hover:underline">
                    {selectedPartner.email}
                  </a>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <a href={`tel:${selectedPartner.phone}`} className="text-[#1E8E5A] hover:underline">
                    {selectedPartner.phone}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">MOSCA Referral Code</div>
                  <div className="font-mono bg-gray-100 px-3 py-1 rounded inline-block">
                    {selectedPartner.referralCode}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Activation Level</div>
                  <div className="font-semibold">{selectedPartner.activationLevel}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Slots Used</div>
                  <div className="font-semibold">{selectedPartner.slotsUsed} / {selectedPartner.customSlotLimit ?? selectedPartner.slotsAvailable}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Assigned</div>
                  <div className="font-semibold">{selectedPartner.totalAssigned}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="font-semibold">{new Date(selectedPartner.createdDate).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
        <EditPartnerModal
          partner={editingPartner}
          onClose={() => setEditingPartner(null)}
          onSuccess={() => {
            setEditingPartner(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
