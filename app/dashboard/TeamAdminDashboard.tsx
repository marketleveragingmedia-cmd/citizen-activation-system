'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddNoteModal from './AddNoteModal'
import AddPartnerModal from './AddPartnerModal'
import AddTeamModal from './AddTeamModal'
import StripeConnectButton from './StripeConnectButton'
import ReassignModal from './ReassignModal'

interface TeamAdminDashboardProps {
  team: any
  hasStripeAccount?: boolean
  stripeAccountId?: string | null
  stats: any
  recentRequests: any[]
  userName: string
}

export default function TeamAdminDashboard({ team, hasStripeAccount, stripeAccountId, stats, recentRequests, userName }: TeamAdminDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showAddNote, setShowAddNote] = useState<any>(null)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showReassign, setShowReassign] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const requestsPerPage = 20

  // Helper to check if request is delayed (3+ days)
  const isDelayed = (request: any) => {
    if (request.status !== 'Assigned') return false
    const daysSince = Math.floor(
      (Date.now() - new Date(request.dateSubmitted).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSince >= 3
  }

  const updateStatus = async (requestId: string, newStatus: string, requesterName: string) => {
    const statusLabels: any = {
      'Invited': 'Invited',
      'OnboardingScheduled': 'Onboarding Scheduled',
      'Activated': 'Wallet Activated'
    }
    
    let confirmMessage = `Mark ${requesterName} as "${statusLabels[newStatus] || newStatus}"?\n\nThis will update the request status.`
    
    if (newStatus === 'Activated') {
      confirmMessage = `⚠️ WALLET ACTIVATED for ${requesterName}?\n\nThis will:\n- Create a new Strategic Partner account\n- Send them login credentials\n- Keep the slot occupied\n\nAre you sure their wallet is fully activated?`
    }
    
    if (!confirm(confirmMessage)) {
      return
    }

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
          <div className="flex items-center gap-4">
            {team.logoUrl && (
              <img src={team.logoUrl} alt={team.name} className="h-10" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-sm text-gray-600">
                {team.tierType === 'FullSystem' ? 'Team Admin Dashboard' : 'Organization Admin Dashboard'}
              </p>
            </div>
          </div>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Requests</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalRequests}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Activations</div>
            <div className="text-3xl font-bold text-[#1E8E5A]">{stats.activations}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Active Strategic Partners</div>
            <div className="text-3xl font-bold text-gray-900">{stats.activePartners}</div>
          </div>
        </div>

        {/* Stripe Connect Section */}
        <div className="mb-8">
          <StripeConnectButton 
            hasStripeAccount={!!hasStripeAccount} 
            stripeAccountId={stripeAccountId || undefined}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAddTeam(true)}
              className="bg-[#C9A441] hover:bg-[#B8932F] text-white font-bold py-3 px-6 rounded-lg"
            >
              + Add Team Admin
            </button>
            <button
              onClick={() => setShowAddPartner(true)}
              className="bg-[#1E8E5A] hover:bg-[#177349] text-white font-bold py-3 px-6 rounded-lg"
            >
              + Add Strategic Partner
            </button>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Requests</h2>
              <p className="text-gray-600 text-sm mt-1">
                Showing {Math.min((currentPage - 1) * requestsPerPage + 1, recentRequests.length)} - {Math.min(currentPage * requestsPerPage, recentRequests.length)} of {recentRequests.length} requests
              </p>
            </div>
            {recentRequests.length > requestsPerPage && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ← Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(recentRequests.length / requestsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(recentRequests.length / requestsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(recentRequests.length / requestsPerPage)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next →
                </button>
              </div>
            )}
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
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No requests yet. Share your request form link to start receiving requests!
                    </td>
                  </tr>
                ) : (
                  recentRequests.slice((currentPage - 1) * requestsPerPage, currentPage * requestsPerPage).map((request: any) => (
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
                      <td className="px-6 py-4 text-sm text-gray-900">{team.name}</td>
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
                              onClick={() => updateStatus(request.id, 'Invited', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              className="text-[#1E8E5A] hover:underline text-sm font-medium"
                            >
                              Invite Sent
                            </button>
                          )}
                          {request.status === 'Invited' && (
                            <button
                              onClick={() => updateStatus(request.id, 'OnboardingScheduled', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              className="text-blue-600 hover:underline text-sm font-medium"
                            >
                              Schedule Onboarding
                            </button>
                          )}
                          {request.status === 'OnboardingScheduled' && (
                            <button
                              onClick={() => updateStatus(request.id, 'Activated', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              className="text-[#1E8E5A] hover:underline text-sm font-medium"
                            >
                              → Wallet Activated
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
                  ))
                )}
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

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddPartner && (
        <AddPartnerModal
          onClose={() => setShowAddPartner(false)}
          onSuccess={() => {
            setShowAddPartner(false)
            window.location.reload()
          }}
        />
      )}

      {showAddTeam && (
        <AddTeamModal
          isMainAdmin={false}
          onClose={() => setShowAddTeam(false)}
          onSuccess={() => {
            setShowAddTeam(false)
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
    </div>
  )
}
