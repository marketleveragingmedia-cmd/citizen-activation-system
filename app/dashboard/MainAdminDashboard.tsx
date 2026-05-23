'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddPartnerModal from './AddPartnerModal'
import AddTeamModal from './AddTeamModal'
import ReassignModal from './ReassignModal'
import AddNoteModal from './AddNoteModal'
import StripeConnectButton from './StripeConnectButton'
import UpdateSlotLimitModal from './UpdateSlotLimitModal'

interface MainAdminDashboardProps {
  stats: any
  recentRequests: any[]
  partners?: any[]
  userName: string
  isWhiteLabel?: boolean
  hasStripeAccount?: boolean
  stripeAccountId?: string | null
}

export default function MainAdminDashboard({ stats, recentRequests, partners = [], userName, isWhiteLabel = false, hasStripeAccount, stripeAccountId }: MainAdminDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showReassign, setShowReassign] = useState<any>(null)
  const [showAddNote, setShowAddNote] = useState<any>(null)
  const [updatingSlots, setUpdatingSlots] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Helper to check if request is delayed (3+ days)
  const isDelayed = (request: any) => {
    if (request.status !== 'Assigned') return false
    const daysSince = Math.floor(
      (Date.now() - new Date(request.dateSubmitted).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSince >= 3
  }

  const updateStatus = async (requestId: string, newStatus: string) => {
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
    }
  }

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request? This cannot be undone.')) {
      return
    }
    
    setIsDeleting(true)
    try {
      const response = await fetch('/api/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      })
      
      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete request')
      }
    } catch (error) {
      alert('Error deleting request')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Main Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/partners" className="text-gray-600 hover:text-gray-900">
              Manage Strategic Partners
            </Link>
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
        {/* Stats Grid */}

        {/* Checkout Pages Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Checkout Pages</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a href="/checkout/team-admin" target="_blank" className="block p-4 border-2 border-[#1E8E5A] rounded-lg hover:bg-green-50 transition">
              <h3 className="font-bold text-[#1E8E5A] mb-1">Team Admin</h3>
              <p className="text-sm text-gray-600 mb-2">$497/year</p>
              <span className="text-xs text-[#1E8E5A]">View Page →</span>
            </a>
            <a href="/checkout/organization-admin" target="_blank" className="block p-4 border-2 border-[#1E8E5A] rounded-lg hover:bg-green-50 transition">
              <h3 className="font-bold text-[#1E8E5A] mb-1">Organization Admin</h3>
              <p className="text-sm text-gray-600 mb-2">$997 Year 1</p>
              <span className="text-xs text-[#1E8E5A]">View Page →</span>
            </a>
            <a href="/checkout/white-label" target="_blank" className="block p-4 border-2 border-[#1E8E5A] rounded-lg hover:bg-green-50 transition">
              <h3 className="font-bold text-[#1E8E5A] mb-1">White-Label</h3>
              <p className="text-sm text-gray-600 mb-2">$1,997 or $2,997</p>
              <span className="text-xs text-[#1E8E5A]">View Page →</span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Teams</div>
            <div className="text-3xl font-bold text-gray-900">{stats.teams}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Requests</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalRequests}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Activations</div>
            <div className="text-3xl font-bold text-[#1E8E5A]">{stats.activations}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Active Strategic Partners</div>
            <div className="text-3xl font-bold text-gray-900">{stats.activePartners}</div>
          </div>
        </div>

        {/* Stripe Connect Section - ONLY for White-Label owners */}
        {isWhiteLabel && (
          <div className="mb-8">
            <StripeConnectButton 
              hasStripeAccount={!!hasStripeAccount} 
              stripeAccountId={stripeAccountId || undefined}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {!isWhiteLabel && (
              <button
                onClick={() => setShowAddTeam(true)}
                className="bg-[#C9A441] hover:bg-[#B8932F] text-white font-bold py-3 px-6 rounded-lg"
              >
                + Add Admin
              </button>
            )}
            <button
              onClick={() => setShowAddPartner(true)}
              className="bg-[#1E8E5A] hover:bg-[#177349] text-white font-bold py-3 px-6 rounded-lg"
            >
              + Add Strategic Partner
            </button>
            <Link
              href="/admin/team-admins"
              className="bg-[#C9A441] hover:bg-[#B8932F] text-white font-bold py-3 px-6 rounded-lg inline-block"
            >
              View All Team Admins
            </Link>
            <Link
              href="/admin/partners"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg inline-block"
            >
              View All Strategic Partners
            </Link>
          </div>
        </div>

        {/* All Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentRequests.map((request: any) => (
                  <tr key={request.id} className={`hover:bg-gray-50 ${isDelayed(request) ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isDelayed(request) && (
                          <span className="text-red-600 font-bold" title="Delayed 3+ days">⚠️</span>
                        )}
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="font-medium text-[#1E8E5A] hover:underline text-left"
                        >
                          {`${request.requesterFirstName} ${request.requesterLastName}`}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`tel:${request.requesterPhone}`} className="text-[#1E8E5A] hover:underline">
                        {request.requesterPhone}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${request.requesterEmail}`} className="text-gray-600 hover:underline text-sm">
                        {request.requesterEmail}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.team?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.activationLevel}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {`${request.assignedPartner?.firstName || ""} ${request.assignedPartner?.lastName || ""}`.trim() || 'Unassigned'}
                    </td>
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
                        {/* Quick Status Update */}
                        {request.status === 'Assigned' && (
                          <button
                            onClick={() => updateStatus(request.id, 'Invited')}
                            className="text-[#1E8E5A] hover:underline text-sm font-medium"
                          >
                            Invite Sent
                          </button>
                        )}
                        {request.status === 'Invited' && (
                          <button
                            onClick={() => updateStatus(request.id, 'OnboardingScheduled')}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            Schedule Onboarding
                          </button>
                        )}
                        {request.status === 'OnboardingScheduled' && (
                          <button
                            onClick={() => updateStatus(request.id, 'Activated')}
                            className="text-[#1E8E5A] hover:underline text-sm font-medium"
                          >
                            Confirm Activation
                          </button>
                        )}
                        <button
                          onClick={() => setShowReassign(request)}
                          className="text-gray-600 hover:underline text-sm font-medium"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => deleteRequest(request.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:underline text-sm font-medium disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
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
                  <div className="text-sm text-gray-600">Assigned Strategic Partner</div>
                  <div className="font-semibold text-lg">
                    {`${selectedRequest.assignedPartner?.firstName || ""} ${selectedRequest.assignedPartner?.lastName || ""}`.trim() || 'Unassigned'}
                  </div>
                  {selectedRequest.assignedPartner?.phone && (
                    <a href={`tel:${selectedRequest.assignedPartner.phone}`} className="text-sm text-[#1E8E5A] hover:underline">
                      {selectedRequest.assignedPartner.phone}
                    </a>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-semibold text-lg">
                    {selectedRequest.status.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Date Submitted</div>
                  <div className="font-semibold">{new Date(selectedRequest.dateSubmitted).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Assignment Type</div>
                  <div className="font-semibold">{selectedRequest.assignmentType}</div>
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
            </div>

            {/* Status Update Buttons (Main Admin can do everything) */}
            {selectedRequest.status !== 'Activated' && (
              <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Update Status:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.status === 'Assigned' && (
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'Invited')}
                      className="px-4 py-2 bg-[#1E8E5A] text-white rounded-lg hover:bg-[#177349]"
                    >
                      Invite Sent
                    </button>
                  )}
                  {selectedRequest.status === 'Invited' && (
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'OnboardingScheduled')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Onboarding Scheduled
                    </button>
                  )}
                  {selectedRequest.status === 'OnboardingScheduled' && (
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'Activated')}
                      className="px-4 py-2 bg-[#1E8E5A] text-white rounded-lg hover:bg-[#177349]"
                    >
                      Confirm Activation
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  deleteRequest(selectedRequest.id)
                  setSelectedRequest(null)
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Request
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowAddNote(selectedRequest)
                    setSelectedRequest(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Note
                </button>
                <button
                  onClick={() => {
                    setShowReassign(selectedRequest)
                    setSelectedRequest(null)
                  }}
                  className="px-4 py-2 bg-[#1E8E5A] text-white rounded-lg hover:bg-[#177349]"
                >
                  Reassign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Partners Section */}
      {partners && partners.length > 0 && (
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Strategic Partners</h2>
            <Link href="/admin/partners" className="text-[#1E8E5A] hover:underline text-sm">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slots</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {partners.map((partner: any) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {`${partner.firstName} ${partner.lastName}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{partner.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${
                        partner.status === 'Full' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {partner.slotsUsed} / {partner.customSlotLimit || partner.slotsAvailable}
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
                      <button
                        onClick={() => setUpdatingSlots(partner)}
                        className="text-[#C9A441] hover:underline text-sm font-medium"
                      >
                        Update Slots
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Add Team Modal */}
      {showAddTeam && (
        <AddTeamModal
          isMainAdmin={true}
          onClose={() => setShowAddTeam(false)}
          onSuccess={() => {
            setShowAddTeam(false)
            window.location.reload()
          }}
        />
      )}

      {/* Add Strategic Partner Modal */}
      {showAddPartner && (
        <AddPartnerModal
          onClose={() => setShowAddPartner(false)}
          onSuccess={() => {
            setShowAddPartner(false)
            window.location.reload()
          }}
        />
      )}

      {/* Reassign Modal */}
      {showReassign && (
        <ReassignModal
          request={showReassign}
          onClose={() => setShowReassign(null)}
          onSuccess={() => {
            setShowReassign(null)
            window.location.reload()
          }}
        />
      )}

      {/* Add Note Modal */}
      {showAddNote && (
        <AddNoteModal
          requestId={showAddNote.id}
          currentNotes={showAddNote.notes || ''}
          onClose={() => setShowAddNote(null)}
          onSuccess={() => {
            setShowAddNote(null)
          }}
        />
      )}

      {/* Update Slot Limit Modal */}
      {updatingSlots && (
        <UpdateSlotLimitModal
          partner={updatingSlots}
          onClose={() => setUpdatingSlots(null)}
          onUpdate={() => window.location.reload()}
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
