'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AddPartnerModal from './AddPartnerModal'
import AddTeamModal from './AddTeamModal'
import ReassignModal from './ReassignModal'
import AddNoteModal from './AddNoteModal'
import StripeConnectButton from './StripeConnectButton'
import UpdateSlotLimitModal from './UpdateSlotLimitModal'
import { btn } from '@/app/lib/buttonStyles'

interface MainAdminDashboardProps {
  stats: any
  recentRequests: any[]
  partners?: any[]
  userName: string
  hasStripeAccount?: boolean
  stripeAccountId?: string | null
  isMasterAdmin?: boolean
  isFounder?: boolean
}

export default function MainAdminDashboard({ stats, recentRequests, partners = [], userName, hasStripeAccount, stripeAccountId, isMasterAdmin = false, isFounder = false }: MainAdminDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showReassign, setShowReassign] = useState<any>(null)
  const [showAddNote, setShowAddNote] = useState<any>(null)
  const [updatingSlots, setUpdatingSlots] = useState<any>(null)
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
      'Activated': 'Activated'
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
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">{isMasterAdmin ? 'Master Admin Dashboard' : 'Main Admin Dashboard'}</h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/partners" className="text-gray-600 hover:text-gray-900">
              Manage Strategic Partners
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            <span className="text-gray-600 flex items-center gap-2">
              {userName}
              {isFounder && (
                <span className="flex items-center gap-1.5 text-yellow-600 font-semibold">
                  <Image src="/founder-badge.png" alt="Founder" width={24} height={24} className="inline" />
                  <span>Founder</span>
                </span>
              )}
            </span>
            <Link href="/api/auth/signout" className="text-red-600 hover:underline">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Grid */}

        {/* Master Admin Quick Links */}
        {isMasterAdmin && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold text-purple-900 mb-4">🔧 Master Admin Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
              <Link href="/master-admin/main-admins" className="block p-3 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition">
                <h3 className="font-bold text-blue-900 text-sm">📊 Main Admins</h3>
                <p className="text-xs text-blue-700 mt-1">Manage Main Admins</p>
              </Link>
              <Link href="/master-admin/team-admins" className="block p-3 bg-white border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition">
                <h3 className="font-bold text-purple-900 text-sm">👥 Team Admins</h3>
                <p className="text-xs text-purple-700 mt-1">Manage Team Admins</p>
              </Link>
              <Link href="/master-admin/org-admins" className="block p-3 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                <h3 className="font-bold text-indigo-900 text-sm">🏢 Org Admins</h3>
                <p className="text-xs text-indigo-700 mt-1">Manage Org Admins</p>
              </Link>
              <Link href="/admin/partners" className="block p-3 bg-white border-2 border-green-600 rounded-lg hover:bg-green-50 transition">
                <h3 className="font-bold text-green-900 text-sm">🤝 Strategic Partners</h3>
                <p className="text-xs text-green-700 mt-1">Manage Partners</p>
              </Link>
              <Link href="/master-admin/founders" className="block p-3 bg-white border-2 border-yellow-600 rounded-lg hover:bg-yellow-50 transition">
                <h3 className="font-bold text-yellow-900 text-sm">⭐ Founders</h3>
                <p className="text-xs text-yellow-700 mt-1">Founders & MOSCA</p>
              </Link>
              <Link href="/master-admin/create-account" className="block p-3 bg-white border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition">
                <h3 className="font-bold text-teal-900 text-sm">➕ Create Account</h3>
                <p className="text-xs text-teal-700 mt-1">No payment required</p>
              </Link>
            </div>
          </div>
        )}

        {/* Checkout Pages Section - Master Admin Only */}
        {isMasterAdmin && (
          <div className="bg-white rounded-lg shadow p-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Checkout Pages</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              <a href="/checkout/main-admin" target="_blank" className="block p-2 border border-[#1E8E5A] rounded hover:bg-green-50 transition">
                <h3 className="font-semibold text-[#1E8E5A] text-sm">Main Admin</h3>
                <p className="text-xs text-gray-600">$1,497 → $997/year</p>
              </a>
              <a href="/checkout/team-admin-direct" target="_blank" className="block p-2 border border-[#1E8E5A] rounded hover:bg-green-50 transition">
                <h3 className="font-semibold text-[#1E8E5A] text-sm">Team Admin Direct</h3>
                <p className="text-xs text-gray-600">$497 → $497/year</p>
              </a>
              <a href="/checkout/org-admin" target="_blank" className="block p-2 border border-[#1E8E5A] rounded hover:bg-green-50 transition">
                <h3 className="font-semibold text-[#1E8E5A] text-sm">Organization Admin</h3>
                <p className="text-xs text-gray-600">$997 → $497/year</p>
              </a>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          {isMasterAdmin ? (
            <>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="text-gray-600 text-xs mb-1">Main Admins</div>
                <div className="text-2xl font-bold text-gray-900">{stats.mainAdmins || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="text-gray-600 text-xs mb-1">Team Admins</div>
                <div className="text-2xl font-bold text-gray-900">{stats.teamAdmins || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="text-gray-600 text-xs mb-1">Org Admins</div>
                <div className="text-2xl font-bold text-gray-900">{stats.orgAdmins || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="text-gray-600 text-xs mb-1">Strategic Partners</div>
                <div className="text-2xl font-bold text-[#1E8E5A]">{stats.activePartners}</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="text-gray-600 text-xs mb-1">Total Teams</div>
                <div className="text-2xl font-bold text-gray-900">{stats.teams}</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="text-gray-600 text-xs mb-1">Total Requests</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="text-gray-600 text-xs mb-1">Total Activations</div>
                <div className="text-2xl font-bold text-[#1E8E5A]">{stats.activations}</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow">
                <div className="text-gray-600 text-xs mb-1">Active Strategic Partners</div>
                <div className="text-2xl font-bold text-gray-900">{stats.activePartners}</div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-4 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddTeam(true)}
              className={btn.brandGold}
            >
              + Add Team / Organization Admin
            </button>
            <button
              onClick={() => setShowAddPartner(true)}
              className={btn.brandGreen}
            >
              + Add Strategic Partner
            </button>
            {!isMasterAdmin && (
              <Link
                href="/admin/partners"
                className={btn.secondary}
              >
                View All Strategic Partners
              </Link>
            )}
          </div>
        </div>

        {/* All Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Requests</h2>
              <p className="text-sm text-gray-600 mt-1">
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
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentRequests.slice((currentPage - 1) * requestsPerPage, currentPage * requestsPerPage).map((request: any) => (
                  <tr key={request.id} className={`hover:bg-gray-50 ${isDelayed(request) ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-2">
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
                    <td className="px-3 py-2">
                      <a href={`tel:${request.requesterPhone}`} className="text-[#1E8E5A] hover:underline">
                        {request.requesterPhone}
                      </a>
                    </td>
                    <td className="px-3 py-2">
                      <a href={`mailto:${request.requesterEmail}`} className="text-gray-600 hover:underline text-sm">
                        {request.requesterEmail}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {request.team?.id ? (
                        <Link href={`/admin/team-admins/${request.team.adminId}`} className="text-[#C9A441] hover:underline">
                          {request.team.name}
                        </Link>
                      ) : (
                        <span className="text-gray-900">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{request.activationLevel}</td>
                    <td className="px-3 py-2 text-sm">
                      {request.assignedPartner ? (
                        <Link
                          href={`/admin/partners/${request.assignedPartner.id}`}
                          className="text-[#1E8E5A] hover:underline font-medium"
                        >
                          {`${request.assignedPartner.firstName} ${request.assignedPartner.lastName}`}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'Activated' ? 'bg-green-100 text-green-800' :
                        request.status === 'OnboardingScheduled' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'Invited' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {new Date(request.dateSubmitted).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
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

            {/* Status Update Buttons - All Stages */}
            <div className="mt-6 border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Update Status:</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateStatus(selectedRequest.id, 'Assigned', `${selectedRequest.requesterFirstName} ${selectedRequest.requesterLastName}`)
                    setSelectedRequest(null)
                  }}
                  disabled={selectedRequest.status === 'Assigned'}
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
                  disabled={selectedRequest.status === 'Invited'}
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
                  disabled={selectedRequest.status === 'OnboardingScheduled'}
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
                  disabled={selectedRequest.status === 'Activated'}
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
                  className="px-4 py-2 bg-[#1E8E5A] text-white rounded-lg hover:bg-[#177349] text-sm font-medium"
                >
                  Reassign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* Add Team Modal */}
      {showAddTeam && (
        <AddTeamModal
          isMainAdmin={true}
          hasStripeAccount={!!hasStripeAccount}
          stripeAccountId={stripeAccountId || undefined}
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
        />
      )}
    </div>
  )
}
