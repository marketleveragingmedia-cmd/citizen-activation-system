'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TeamAdminDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [teamAdmin, setTeamAdmin] = useState<any>(null)
  const [partners, setPartners] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchTeamAdminData()
  }, [params.id])

  const fetchTeamAdminData = async () => {
    try {
      const response = await fetch(`/api/admin/team-admin/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setTeamAdmin(data.teamAdmin)
        setPartners(data.partners || [])
        setRequests(data.requests || [])
      } else{
        alert('Failed to load team admin data')
        router.push('/dashboard')
      }
    } catch (error) {
      alert('Error loading team admin data')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!teamAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Team Admin not found</div>
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
            <h1 className="text-xl font-bold text-gray-900">Team Admin Details</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Team Admin Profile Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {teamAdmin.firstName} {teamAdmin.lastName}
                </h2>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${teamAdmin.email}`} className="text-[#1E8E5A] hover:underline">
                      {teamAdmin.email}
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Team:</span> {teamAdmin.team?.name || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Role:</span> Team Admin
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-[#C9A441] text-white">
                  Team Admin
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{partners.length}</div>
              <div className="text-sm text-gray-600">Strategic Partners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{requests.length}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{statusCounts.OnboardingScheduled}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{statusCounts.Activated}</div>
              <div className="text-sm text-gray-600">Activated</div>
            </div>
          </div>
        </div>

        {/* Strategic Partners Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">Strategic Partners</h3>
          </div>
          {partners.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No strategic partners assigned yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slots Used</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {partners.map((partner: any) => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {partner.firstName} {partner.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a href={`mailto:${partner.email}`} className="text-[#1E8E5A] hover:underline">
                          {partner.email}
                        </a>
                      </td>
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
                        <Link
                          href={`/admin/partners/${partner.id}`}
                          className="text-[#1E8E5A] hover:underline text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Requests Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Team Requests</h3>
              
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
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
                        {request.assignedPartner ? (
                          <Link
                            href={`/admin/partners/${request.assignedPartner.id}`}
                            className="text-[#1E8E5A] hover:underline"
                          >
                            {request.assignedPartner.firstName} {request.assignedPartner.lastName}
                          </Link>
                        ) : (
                          'Unassigned'
                        )}
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
                          <span className="text-gray-400 text-sm">View Only</span>
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
