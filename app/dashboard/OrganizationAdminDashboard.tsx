'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddNoteModal from './AddNoteModal'
import AddPartnerModal from './AddPartnerModal'
import AddTeamModal from './AddTeamModal'
import StripeConnectButton from './StripeConnectButton'
import ReassignModal from './ReassignModal'
import BrandingSettingsModal from './BrandingSettingsModal'

interface OrganizationAdminDashboardProps {
  team: any
  hasStripeAccount?: boolean
  stripeAccountId?: string | null
  stats: any
  recentRequests: any[]
  userName: string
}

export default function OrganizationAdminDashboard({ 
  team, 
  hasStripeAccount, 
  stripeAccountId, 
  stats, 
  recentRequests, 
  userName 
}: OrganizationAdminDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showAddNote, setShowAddNote] = useState<any>(null)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showReassign, setShowReassign] = useState<any>(null)
  const [showBrandingSettings, setShowBrandingSettings] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const requestsPerPage = 20

  // Get branding
  const organizationName = team.organizationName || team.name || 'Organization'
  const logoUrl = team.logoUrl
  const primaryColor = team.primaryColor || '#1E8E5A'
  const subdomain = team.subdomain || 'your-org'

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
      {/* Header */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img src={logoUrl} alt={organizationName} className="h-12 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organizationName}</h1>
              <p className="text-sm text-gray-600">Organization Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{userName}</span>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
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
            <div className="text-gray-600 text-sm mb-2">Active (Assigned)</div>
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>{stats.pending}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Wallet Activations</div>
            <div className="text-3xl font-bold" style={{ color: primaryColor }}>{stats.activations}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Strategic Partners</div>
            <div className="text-3xl font-bold text-gray-900">{stats.activePartners}</div>
          </div>
        </div>

        {/* Subdomain Link Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Your Organization Invitation Link</h3>
          <p className="text-sm text-blue-800 mb-3">
            Share this link with your members. All requests will be assigned to your Strategic Partners.
          </p>
          <div className="bg-white border border-blue-300 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <code className="text-blue-900 font-mono text-sm">
                https://{subdomain}.citizenactivation.com/request
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://${subdomain}.citizenactivation.com/request`)
                  alert('Link copied!')
                }}
                className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex-shrink-0"
              >
                Copy Link
              </button>
            </div>
            <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
              <p className="text-xs text-yellow-900 font-semibold mb-1">
                💡 Your Subdomain: <span className="font-mono text-sm bg-white px-2 py-1 rounded border border-yellow-400">{subdomain}</span>
              </p>
              <p className="text-xs text-yellow-800">
                When sharing this link, be sure to <strong>replace "your-org"</strong> with <strong>your subdomain</strong> like:
              </p>
              <ul className="text-xs text-yellow-800 mt-1 ml-4 space-y-1">
                <li>• "abc-ministry.citizenactivation.com"</li>
                <li>• "main-charity.citizenactivation.com"</li>
                <li>• "grace-church.citizenactivation.com"</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddTeam(true)}
              className="bg-[#C9A441] hover:bg-[#B8932F] text-white font-bold py-3 px-6 rounded-lg"
            >
              + Add Team Admin
            </button>
            <button
              onClick={() => setShowAddTeam(true)}
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3 px-6 rounded-lg"
            >
              + Add Organization Admin
            </button>
            <button
              onClick={() => setShowAddPartner(true)}
              style={{ backgroundColor: primaryColor }}
              className="hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg"
            >
              + Add Strategic Partner
            </button>
            <button
              onClick={() => setShowBrandingSettings(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              🎨 Branding Settings
            </button>
            {!hasStripeAccount && (
              <StripeConnectButton />
            )}
          </div>

          {hasStripeAccount && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-800">Stripe Connected</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You'll receive $200 for each Team Admin you add.
              </p>
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
          </div>
          
          {recentRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">No requests yet</p>
              <p className="text-sm">Share your invitation link to start receiving requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentRequests.slice((currentPage - 1) * requestsPerPage, currentPage * requestsPerPage).map((request) => (
                    <tr key={request.id} className={isDelayed(request) ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {request.requesterFirstName} {request.requesterLastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.requesterEmail}</div>
                        <div className="text-sm text-gray-500">{request.requesterPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.assignedPartner 
                            ? `${request.assignedPartner.firstName} ${request.assignedPartner.lastName}`
                            : 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'Activated' ? 'bg-green-100 text-green-800' :
                          request.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'Invited' ? 'bg-purple-100 text-purple-800' :
                          request.status === 'OnboardingScheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status === 'OnboardingScheduled' ? 'Onboarding' : request.status}
                        </span>
                        {isDelayed(request) && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Delayed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.dateSubmitted).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowAddNote(request)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Note
                          </button>
                          {request.status === 'Assigned' && (
                            <>
                              <button
                                onClick={() => updateStatus(request.id, 'Invited', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                Invited
                              </button>
                              <button
                                onClick={() => setShowReassign(request)}
                                className="text-orange-600 hover:text-orange-800"
                              >
                                Reassign
                              </button>
                            </>
                          )}
                          {request.status === 'Invited' && (
                            <button
                              onClick={() => updateStatus(request.id, 'OnboardingScheduled', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              Scheduled
                            </button>
                          )}
                          {request.status === 'OnboardingScheduled' && (
                            <button
                              onClick={() => updateStatus(request.id, 'Activated', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              className="text-green-600 hover:text-green-800 font-semibold"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => deleteRequest(request.id)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isDeleting}
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
          )}
        </div>
      </div>

      {/* Modals */}
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
          onClose={() => setShowAddTeam(false)}
          onSuccess={() => {
            setShowAddTeam(false)
            window.location.reload()
          }}
          isMainAdmin={true}
          hasStripeAccount={hasStripeAccount}
          stripeAccountId={stripeAccountId}
        />
      )}

      {showAddNote && (
        <AddNoteModal
          request={showAddNote}
          onClose={() => setShowAddNote(null)}
          onSuccess={() => {
            setShowAddNote(null)
            window.location.reload()
          }}
        />
      )}

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

      {showBrandingSettings && (
        <BrandingSettingsModal
          team={team}
          onClose={() => setShowBrandingSettings(false)}
          onSuccess={() => {
            setShowBrandingSettings(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
