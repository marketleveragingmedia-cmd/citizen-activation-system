'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PartnerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [partner, setPartner] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchPartnerData()
  }, [params.id])

  const fetchPartnerData = async () => {
    try {
      const response = await fetch(`/api/admin/partner/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setPartner(data.partner)
        setRequests(data.requests || [])
      } else {
        alert('Failed to load partner data')
        router.push('/dashboard')
      }
    } catch (error) {
      alert('Error loading partner data')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (requestId: string, newStatus: string, requesterName: string) => {
    const statusLabels: any = {
      'Invited': 'Invited',
      'OnboardingScheduled': 'Onboarding Scheduled',
      'Activated': 'Activated'
    }
    
    let confirmMessage = `Mark ${requesterName} as "${statusLabels[newStatus] || newStatus}"?\n\nThis will update the request status.`
    
    if (newStatus === 'Activated') {
      confirmMessage = `⚠️ ACTIVATE ${requesterName}?\n\nThis will:\n- Create a new Strategic Partner account\n- Send them login credentials\n- Keep the slot occupied\n\nAre you sure they are fully activated?`
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
        fetchPartnerData()
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      alert('Error updating status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Partner not found</div>
      </div>
    )
  }

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter)

  const statusCounts = {
    all: requests.length,
    Assigned: requests.filter(r => r.status === 'Assigned').length,
    OnboardingScheduled: requests.filter(r => r.status === 'OnboardingScheduled').length,
    Invited: requests.filter(r => r.status === 'Invited').length,
    Activated: requests.filter(r => r.status === 'Activated').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[#1E8E5A] hover:underline">
              ← Back to Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold text-gray-900">Strategic Partner Details</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Partner Profile Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {partner.firstName} {partner.lastName}
                </h2>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${partner.email}`} className="text-[#1E8E5A] hover:underline">
                      {partner.email}
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Team:</span> {partner.team?.name || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  partner.status === 'Active' ? 'bg-green-100 text-green-800' :
                  partner.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {partner.status}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{requests.length}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{statusCounts.Assigned}</div>
              <div className="text-sm text-gray-600">Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{statusCounts.OnboardingScheduled}</div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{statusCounts.Activated}</div>
              <div className="text-sm text-gray-600">Activated</div>
            </div>
          </div>

          {/* Slot Usage */}
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Slot Usage:</span>
                <span className={`text-lg font-bold ${
                  partner.status === 'Full' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {partner.slotsUsed} / {partner.customSlotLimit || partner.slotsAvailable}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    partner.status === 'Full' ? 'bg-red-600' : 'bg-green-600'
                  }`}
                  style={{ 
                    width: `${Math.min(100, (partner.slotsUsed / (partner.customSlotLimit || partner.slotsAvailable)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Requests Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Assigned Requests</h3>
              
              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    statusFilter === 'all' 
                      ? 'bg-[#1E8E5A] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({statusCounts.all})
                </button>
                <button
                  onClick={() => setStatusFilter('Assigned')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    statusFilter === 'Assigned' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Assigned ({statusCounts.Assigned})
                </button>
                <button
                  onClick={() => setStatusFilter('OnboardingScheduled')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    statusFilter === 'OnboardingScheduled' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Scheduled ({statusCounts.OnboardingScheduled})
                </button>
                <button
                  onClick={() => setStatusFilter('Invited')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    statusFilter === 'Invited' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Invited ({statusCounts.Invited})
                </button>
                <button
                  onClick={() => setStatusFilter('Activated')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    statusFilter === 'Activated' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Activated ({statusCounts.Activated})
                </button>
              </div>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No requests found for this filter
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRequests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {request.requesterFirstName} {request.requesterLastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <a href={`mailto:${request.requesterEmail}`} className="text-[#1E8E5A] hover:underline block">
                            {request.requesterEmail}
                          </a>
                          <a href={`tel:${request.requesterPhone}`} className="text-gray-600 hover:underline">
                            {request.requesterPhone}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.activationLevel}
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
                          {/* Forward actions */}
                          {request.status === 'Assigned' && (
                            <button
                              onClick={() => updateStatus(request.id, 'OnboardingScheduled', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              className="text-xs text-blue-600 hover:underline text-left"
                            >
                              → Schedule Onboarding
                            </button>
                          )}
                          {request.status === 'OnboardingScheduled' && (
                            <>
                              <button
                                onClick={() => updateStatus(request.id, 'Invited', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                className="text-xs text-purple-600 hover:underline text-left"
                              >
                                → Mark Invited
                              </button>
                              <button
                                onClick={() => updateStatus(request.id, 'Assigned', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                className="text-xs text-gray-500 hover:underline text-left"
                              >
                                ← Back to Assigned
                              </button>
                            </>
                          )}
                          {request.status === 'Invited' && (
                            <>
                              <button
                                onClick={() => updateStatus(request.id, 'Activated', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                className="text-xs text-green-600 hover:underline text-left"
                              >
                                → Mark Activated
                              </button>
                              <button
                                onClick={() => updateStatus(request.id, 'OnboardingScheduled', `${request.requesterFirstName} ${request.requesterLastName}`)}
                                className="text-xs text-gray-500 hover:underline text-left"
                              >
                                ← Back to Scheduled
                              </button>
                            </>
                          )}
                          {request.status === 'Activated' && (
                            <button
                              onClick={() => updateStatus(request.id, 'Invited', `${request.requesterFirstName} ${request.requesterLastName}`)}
                              className="text-xs text-gray-500 hover:underline text-left"
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
    </div>
  )
}
