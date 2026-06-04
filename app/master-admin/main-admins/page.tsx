import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function MainAdminsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email }
  })

  if (!admin || admin.role !== 'MASTER_ADMIN') {
    redirect('/dashboard')
  }

  // Get all Main Admins
  const mainAdmins = await prisma.admin.findMany({
    where: {
      role: 'MAIN_ADMIN'
    },
    include: {
      team: true,
      teamsCreated: {
        select: {
          id: true,
          tierType: true
        }
      }
    },
    orderBy: {
      createdDate: 'desc'
    }
  })

  // Calculate stats
  const totalMainAdmins = mainAdmins.length
  const activeMainAdmins = mainAdmins.filter(a => a.status === 'Active').length
  const inactiveMainAdmins = mainAdmins.filter(a => a.status === 'Inactive').length
  const founders = mainAdmins.filter(a => a.isFounder).length
  const regularMainAdmins = mainAdmins.filter(a => !a.isFounder).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Main Admins Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
            <Link href="/api/auth/signout" className="text-red-600 hover:underline">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Main Admins</div>
            <div className="text-3xl font-bold text-gray-900">{totalMainAdmins}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Active</div>
            <div className="text-3xl font-bold text-green-600">{activeMainAdmins}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Inactive</div>
            <div className="text-3xl font-bold text-gray-600">{inactiveMainAdmins}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Founders</div>
            <div className="text-3xl font-bold text-yellow-600">{founders}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Regular</div>
            <div className="text-3xl font-bold text-blue-600">{regularMainAdmins}</div>
          </div>
        </div>

        {/* Main Admins Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Main Admin Accounts</h2>
          </div>

          {mainAdmins.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No Main Admin accounts yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Network</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mainAdmins.map((mainAdmin) => {
                    const teamAdmins = mainAdmin.teamsCreated.filter(t => t.tierType === 'FullSystem').length
                    const orgAdmins = mainAdmin.teamsCreated.filter(t => t.tierType === 'SoloOrg').length

                    return (
                      <tr key={mainAdmin.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {mainAdmin.status === 'Active' ? (
                            <span className="text-green-600 font-semibold">✅ Active</span>
                          ) : (
                            <span className="text-gray-600 font-semibold">⏸️ Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {mainAdmin.firstName} {mainAdmin.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{mainAdmin.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {mainAdmin.subdomain || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {mainAdmin.isFounder ? (
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              ⭐ Founder
                            </span>
                          ) : (
                            <span className="text-gray-600 text-sm">Main Admin</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {mainAdmin.founderPaymentMethod || '-'}
                          </div>
                          {mainAdmin.founderPaymentMethod && (
                            <div className="text-xs text-gray-500">
                              {mainAdmin.isFounder ? '$997' : '$1,497'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {teamAdmins} Team, {orgAdmins} Org
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {new Date(mainAdmin.createdDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            ID: {mainAdmin.id.slice(0, 8)}...
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
