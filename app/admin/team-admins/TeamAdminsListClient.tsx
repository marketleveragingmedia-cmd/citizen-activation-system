'use client'

import Link from 'next/link'

interface TeamAdminsListClientProps {
  teams: any[]
  userName: string
}

export default function TeamAdminsListClient({ teams, userName }: TeamAdminsListClientProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Admins</h1>
              <p className="text-gray-600 mt-2">Manage all Team Admin accounts</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partners</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No Team Admins found
                    </td>
                  </tr>
                ) : (
                  teams.map((team) => {
                    const admin = team.admins.find((a: any) => a.role === 'TEAM_ADMIN' || a.role === 'MAIN_ADMIN')
                    return (
                      <tr key={team.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {admin ? (
                            <Link
                              href={`/admin/team-admins/${admin.id}`}
                              className="font-medium text-[#1E8E5A] hover:underline"
                            >
                              {team.name}
                            </Link>
                          ) : (
                            <span className="font-medium text-gray-900">{team.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {admin ? (
                            <Link
                              href={`/admin/team-admins/${admin.id}`}
                              className="text-[#1E8E5A] hover:underline"
                            >
                              {admin.firstName} {admin.lastName}
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{admin?.email || 'N/A'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-900 font-medium">{team._count.requests}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-900 font-medium">{team._count.strategicPartners}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            team.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {team.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(team.createdDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {admin ? (
                              <Link
                                href={`/admin/team-admins/${admin.id}`}
                                className="text-[#1E8E5A] hover:underline text-sm font-medium"
                              >
                                View Details
                              </Link>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
