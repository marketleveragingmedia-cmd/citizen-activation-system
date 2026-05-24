'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Request {
  id: string
  requesterFirstName: string
  requesterLastName: string
  requesterEmail: string
  requesterPhone: string
  activationLevel: string
  status: string
  dateSubmitted: Date | string
  referralCodeUsed: string | null
  notes: string | null
}

interface Partner {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  referralCode: string
  slotsUsed: number
  slotsAvailable: number
  activationLevel: string
}

interface Props {
  partner: Partner
  assignedRequests: Request[]
  userName: string
}

export default function StrategicPartnerDashboard({ partner, assignedRequests, userName }: Props) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const updateStatus = async (requestId: string, newStatus: string, requesterName: string) => {
    const statusLabels: any = {
      'Invited': 'Invited',
      'OnboardingScheduled': 'Onboarding Scheduled',
      'Activated': 'Activated'
    }
    
    let confirmMessage = `Mark ${requesterName} as "${statusLabels[newStatus] || newStatus}"?\n\nThis will update the request status.`
    
    if (newStatus === 'Activated') {
      confirmMessage = `⚠️ WALLET ACTIVATED for ${requesterName}?\n\nThis will:\n- Create a new Strategic Partner account\n- Send them login credentials\n- Keep the slot occupied\n\nAre you sure their wallet is fully activated?`
    }
    
    if (!confirm(confirmMessage)) {
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: newStatus })
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      alert('Error updating status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Strategic Partner Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            <span className="text-gray-600">{userName}</span>
            <Link href="/api/auth/signout" className="text-red-600 hover:underline">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Partner Info Card */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-600 text-sm">Activation Level</div>
              <div className="text-lg font-semibold">{partner.activationLevel}</div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Phone Number</div>
              <div className="text-lg font-semibold">{partner.phone || 'Not set'}</div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Slots Used</div>
              <div className="text-lg font-semibold">
                {partner.slotsUsed} / {partner.slotsAvailable}
              </div>
            </div>
            <div>
              <div className="text-gray-600 text-sm">Your Referral Code</div>
              <div className="text-lg font-semibold font-mono bg-gray-100 px-3 py-1 rounded">
                {partner.referralCode}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Your Assigned Requests</h2>
          </div>
          {assignedRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No requests assigned yet. You'll be notified when new requests are assigned.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {assignedRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="font-medium text-[#1E8E5A] hover:underline text-left"
                        >
                          {`${request.requesterFirstName} ${request.requesterLastName}`}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`tel:${request.requesterPhone}`} className="text-[#1E8E5A] hover:underline font-medium">
                          {request.requesterPhone}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`mailto:${request.requesterEmail}`} className="text-gray-600 hover:underline text-sm">
                          {request.requesterEmail}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{request.activationLevel}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'Activated' ? 'bg-green-100 text-green-800' :
                          request.status === 'OnboardingScheduled' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'Invited' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(request.dateSubmitted).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {/* Forward actions */}
                          {request.status === 'Assigned' && (
                            <button
                              onClick={() => updateStatus(request.id, 'OnboardingScheduled', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              disabled={isUpdating}
                              className="text-xs text-blue-600 hover:underline font-medium disabled:opacity-50 text-left"
                            >
                              → Schedule Onboarding
                            </button>
                          )}
                          {request.status === 'OnboardingScheduled' && (
                            <>
                              <button
                                onClick={() => updateStatus(request.id, 'Invited', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                disabled={isUpdating}
                                className="text-xs text-purple-600 hover:underline font-medium disabled:opacity-50 text-left"
                              >
                                → Mark Invited
                              </button>
                              <button
                                onClick={() => updateStatus(request.id, 'Assigned', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                disabled={isUpdating}
                                className="text-xs text-gray-500 hover:underline font-medium disabled:opacity-50 text-left"
                              >
                                ← Back to Assigned
                              </button>
                            </>
                          )}
                          {request.status === 'Invited' && (
                            <>
                              <button
                                onClick={() => updateStatus(request.id, 'Activated', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                disabled={isUpdating}
                                className="text-xs text-green-600 hover:underline font-medium disabled:opacity-50 text-left"
                              >
                                → Wallet Activated
                              </button>
                              <button
                                onClick={() => updateStatus(request.id, 'OnboardingScheduled', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                disabled={isUpdating}
                                className="text-xs text-gray-500 hover:underline font-medium disabled:opacity-50 text-left"
                              >
                                ← Back to Scheduled
                              </button>
                            </>
                          )}
                          {request.status === 'Activated' && (
                            <button
                              onClick={() => updateStatus(request.id, 'Invited', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              disabled={isUpdating}
                              className="text-xs text-gray-500 hover:underline font-medium disabled:opacity-50 text-left"
                            >
                              ← Back to Invited
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-semibold text-lg">{`${selectedRequest.requesterFirstName} ${selectedRequest.requesterLastName}`}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Activation Level</div>
                  <div className="font-semibold text-lg">{selectedRequest.activationLevel}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Phone Number</div>
                  <a href={`tel:${selectedRequest.requesterPhone}`} className="font-semibold text-lg text-[#1E8E5A] hover:underline">
                    {selectedRequest.requesterPhone}
                  </a>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <a href={`mailto:${selectedRequest.requesterEmail}`} className="font-semibold text-lg text-[#1E8E5A] hover:underline break-all">
                    {selectedRequest.requesterEmail}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-semibold text-lg">
                    {selectedRequest.status.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Date Submitted</div>
                  <div className="font-semibold text-lg">
                    {new Date(selectedRequest.dateSubmitted).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {selectedRequest.referralCodeUsed && (
                <div>
                  <div className="text-sm text-gray-600">Referral Code Used</div>
                  <div className="font-semibold text-lg font-mono bg-gray-100 px-3 py-1 rounded inline-block">
                    {selectedRequest.referralCodeUsed}
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <div className="text-sm text-gray-600">Notes</div>
                  <div className="text-gray-900 bg-gray-50 p-3 rounded">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}

              {/* Status Change Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Update Status:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      updateStatus(selectedRequest.id, 'Assigned', `${selectedRequest.requesterFirstName} ${selectedRequest.requesterLastName}`)
                      setSelectedRequest(null)
                    }}
                    disabled={isUpdating || selectedRequest.status === 'Assigned'}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      selectedRequest.status === 'Assigned'
                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedRequest.status === 'Assigned' ? '✓ ' : ''}Assigned
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedRequest.id, 'Invited', `${selectedRequest.requesterFirstName} ${selectedRequest.requesterLastName}`)
                      setSelectedRequest(null)
                    }}
                    disabled={isUpdating || selectedRequest.status === 'Invited'}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      selectedRequest.status === 'Invited'
                        ? 'bg-purple-100 text-purple-800 border-2 border-purple-500'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedRequest.status === 'Invited' ? '✓ ' : ''}Invited
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedRequest.id, 'OnboardingScheduled', `${selectedRequest.requesterFirstName} ${selectedRequest.requesterLastName}`)
                      setSelectedRequest(null)
                    }}
                    disabled={isUpdating || selectedRequest.status === 'OnboardingScheduled'}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      selectedRequest.status === 'OnboardingScheduled'
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedRequest.status === 'OnboardingScheduled' ? '✓ ' : ''}Onboarding Scheduled
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedRequest.id, 'Activated', `${selectedRequest.requesterFirstName} ${selectedRequest.requesterLastName}`)
                      setSelectedRequest(null)
                    }}
                    disabled={isUpdating || selectedRequest.status === 'Activated'}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                      selectedRequest.status === 'Activated'
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedRequest.status === 'Activated' ? '✓ ' : ''}Wallet Activated
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <a
                href={`tel:${selectedRequest.requesterPhone}`}
                className="px-4 py-2 bg-[#1E8E5A] text-white rounded-lg hover:bg-[#177349]"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
