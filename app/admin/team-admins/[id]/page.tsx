'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TeamAdminDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [teamAdmin, setTeamAdmin] = useState<any>(null)
  const [partners, setPartners] = useState<any[]>([])
  const [requestCounts, setRequestCounts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        setRequestCounts(data.requestCounts || { total: 0, assigned: 0, invited: 0, onboardingScheduled: 0, activated: 0 })
      } else {
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

  if (!requestCounts) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-xl text-gray-600">Loading...</div></div>
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
              <div className="text-3xl font-bold text-gray-900">{requestCounts.total}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{requestCounts.onboardingScheduled}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{requestCounts.activated}</div>
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

        {/* Request Stats Summary - No PII */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold text-gray-900">Team Request Summary</h3>
            <p className="text-sm text-gray-600 mt-1">Aggregated counts (no contact details shown for privacy)</p>
          </div>
          <div className="grid grid-cols-4 gap-6 p-6">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{requestCounts.assigned}</div>
              <div className="text-sm text-gray-600">Assigned</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{requestCounts.invited}</div>
              <div className="text-sm text-gray-600">Invited</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{requestCounts.onboardingScheduled}</div>
              <div className="text-sm text-gray-600">Onboarding Scheduled</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{requestCounts.activated}</div>
              <div className="text-sm text-gray-600">Activated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
