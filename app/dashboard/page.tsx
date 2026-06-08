import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import StrategicPartnerDashboard from './StrategicPartnerDashboard'
import MainAdminDashboard from './MainAdminDashboard'
import TeamAdminDashboard from './TeamAdminDashboard'
import OrganizationAdminDashboard from './OrganizationAdminDashboard'


async function getDashboardData(userId: string, role: string, type: string) {
  // MASTER ADMIN - Sees everything across all networks
  if (type === 'admin' && role === 'MASTER_ADMIN') {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      include: { team: true }
    })

    const stats = await prisma.$transaction([
      prisma.admin.count({ where: { role: 'MAIN_ADMIN', status: 'Active' } }), // Main Admins
      prisma.admin.count({ where: { role: 'TEAM_ADMIN', status: 'Active' } }), // Team Admins
      prisma.admin.count({ where: { role: 'ORG_ADMIN', status: 'Active' } }), // Org Admins
      prisma.request.count(),
      prisma.request.count({ where: { status: 'Activated' } }),
      prisma.strategicPartner.count({ where: { status: 'Active' } })
    ])

    const recentRequests = await prisma.request.findMany({
      take: 25,
      orderBy: { dateSubmitted: 'desc' },
      include: {
        assignedPartner: true,
        team: true
      }
    })

    const partners = await prisma.strategicPartner.findMany({
      include: {
        team: true
      },
      orderBy: { createdDate: 'desc' }
    })

    return {
      type: 'master_admin',
      hasStripeAccount: !!admin?.team?.stripeAccountId,
      stripeAccountId: admin?.team?.stripeAccountId,
      stats: {
        mainAdmins: stats[0],
        teamAdmins: stats[1],
        orgAdmins: stats[2],
        totalRequests: stats[3],
        activations: stats[4],
        activePartners: stats[5]
      },
      recentRequests,
      partners
    }
  }

  // MAIN ADMIN - Sees only their network
  if (type === 'admin' && role === 'MAIN_ADMIN') {
    // Main Admin Dashboard  
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      include: { team: true }
    })

    if (!admin || !admin.teamId) {
      return null
    }

    // For now, show their team's data only
    // TODO: Include Team Admins' teams when needed
    const teamId = admin.teamId

    const stats = await prisma.$transaction([
      prisma.team.count({ where: { id: teamId, status: 'Active' } }),
      prisma.request.count({ where: { teamId } }),
      prisma.request.count({ where: { teamId, status: 'Activated' } }),
      prisma.strategicPartner.count({ where: { teamId, status: 'Active' } })
    ])

    const recentRequests = await prisma.request.findMany({
      where: { teamId },
      take: 25,
      orderBy: { dateSubmitted: 'desc' },
      include: {
        assignedPartner: true,
        team: true
      }
    })

    const partners = await prisma.strategicPartner.findMany({
      where: { teamId },
      include: {
        team: true
      },
      orderBy: { createdDate: 'desc' }
    })

    return {
      type: 'main_admin',
      hasStripeAccount: !!admin?.team?.stripeAccountId,
      stripeAccountId: admin?.team?.stripeAccountId,
      stats: {
        teams: stats[0],
        totalRequests: stats[1],
        activations: stats[2],
        activePartners: stats[3]
      },
      recentRequests,
      partners
    }
  }

  // ORG ADMIN - Sees only their organization/network
  if (type === 'admin' && role === 'ORG_ADMIN') {
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      include: { team: true }
    })

    if (!admin || !admin.teamId) {
      return null
    }

    const stats = await prisma.$transaction([
      prisma.request.count({ where: { teamId: admin.teamId } }),
      prisma.request.count({ where: { teamId: admin.teamId, status: 'Assigned' } }),
      prisma.request.count({ where: { teamId: admin.teamId, status: 'Activated' } }),
      prisma.strategicPartner.count({ where: { teamId: admin.teamId, status: 'Active' } })
    ])

    const recentRequests = await prisma.request.findMany({
      where: { teamId: admin.teamId },
      orderBy: { dateSubmitted: 'desc' },
      include: { assignedPartner: true }
    })

    return {
      type: 'org_admin',
      team: admin.team,
      adminSubdomain: admin.subdomain, // Organization Admin's personal subdomain
      hasStripeAccount: !!admin.team.stripeAccountId,
      stripeAccountId: admin.team.stripeAccountId,
      stats: {
        totalRequests: stats[0],
        pending: stats[1],
        activations: stats[2],
        activePartners: stats[3]
      },
      recentRequests
    }
  }

  // TEAM ADMIN - Manages Strategic Partners and requests
  if (type === 'admin' && role === 'TEAM_ADMIN') {
    // Team Admin Dashboard
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      include: { team: true }
    })

    if (!admin || !admin.teamId) {
      return null
    }

    const stats = await prisma.$transaction([
      prisma.request.count({ where: { teamId: admin.teamId } }),
      prisma.request.count({ where: { teamId: admin.teamId, status: 'Assigned' } }),
      prisma.request.count({ where: { teamId: admin.teamId, status: 'Activated' } }),
      prisma.strategicPartner.count({ where: { teamId: admin.teamId, status: 'Active' } })
    ])

    const recentRequests = await prisma.request.findMany({
      where: { teamId: admin.teamId },
      orderBy: { dateSubmitted: 'desc' },
      include: { assignedPartner: true }
    })

    return {
      type: 'team_admin',
      team: admin.team,
      hasStripeAccount: !!admin.team.stripeAccountId,
      stripeAccountId: admin.team.stripeAccountId,
      stats: {
        totalRequests: stats[0],
        pending: stats[1],
        activations: stats[2],
        activePartners: stats[3]
      },
      recentRequests
    }
  }

  if (type === 'partner') {
    // Strategic Partner Dashboard
    const partner = await prisma.strategicPartner.findUnique({
      where: { id: userId }
    })

    if (!partner) {
      return null
    }

    const assignedRequests = await prisma.request.findMany({
      where: { assignedPartnerId: userId },
      orderBy: { dateSubmitted: 'desc' },
      include: { team: true }
    })

    return {
      type: 'strategic_partner',
      partner,
      assignedRequests
    }
  }

  return null
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const data = await getDashboardData(
    session.user.id,
    session.user.role,
    session.user.type
  )

  if (!data) {
    return <div>Error loading dashboard</div>
  }

  // Master Admin Dashboard
  if (data.type === 'master_admin' && 'stats' in data) {
    return (
      <MainAdminDashboard
        stats={data.stats}
        recentRequests={data.recentRequests}
        partners={data.partners || []}
        userName={session.user.name}
        hasStripeAccount={data.hasStripeAccount}
        stripeAccountId={data.stripeAccountId}
        isMasterAdmin={true}
        isFounder={session.user.isFounder || false}
      />
    )
  }

  // Main Admin Dashboard
  if (data.type === 'main_admin' && 'stats' in data) {
    return (
      <MainAdminDashboard
        stats={data.stats}
        recentRequests={data.recentRequests}
        partners={data.partners || []}
        userName={session.user.name}
        hasStripeAccount={data.hasStripeAccount}
        stripeAccountId={data.stripeAccountId}
        isMasterAdmin={false}
        isFounder={session.user.isFounder || false}
      />
    )
  }

  // Org Admin Dashboard
  if (data.type === 'org_admin' && 'team' in data) {
    return (
      <OrganizationAdminDashboard
        team={data.team}
        adminSubdomain={data.adminSubdomain}
        hasStripeAccount={data.hasStripeAccount}
        stripeAccountId={data.stripeAccountId}
        stats={data.stats}
        recentRequests={data.recentRequests}
        userName={session.user.name}
      />
    )
  }

  // Team Admin Dashboard
  if (data.type === 'team_admin' && 'team' in data) {
    return (
      <TeamAdminDashboard
        team={data.team}
        hasStripeAccount={data.hasStripeAccount}
        stripeAccountId={data.stripeAccountId}
        stats={data.stats}
        recentRequests={data.recentRequests}
        userName={session.user.name}
      />
    )
  }

  // Main Admin Dashboard Legacy
  if (data.type === 'main_admin_legacy' && 'stats' in data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Main Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{session.user.name}</span>
              <Link href="/api/auth/signout" className="text-[#1E8E5A] hover:text-[#177349] font-semibold">
                Sign Out
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm mb-2">Total Teams</div>
              <div className="text-3xl font-bold text-gray-900">{data.stats.teams}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm mb-2">Total Requests</div>
              <div className="text-3xl font-bold text-gray-900">{data.stats.totalRequests}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm mb-2">Total Activations</div>
              <div className="text-3xl font-bold text-[#1E8E5A]">{data.stats.activations}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-gray-600 text-sm mb-2">Active Partners</div>
              <div className="text-3xl font-bold text-gray-900">{data.stats.activePartners}</div>
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.recentRequests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{`${request.requesterFirstName} ${request.requesterLastName}`}</div>
                        <div className="text-sm text-gray-500">{request.requesterEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{request.team?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{request.activationLevel}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {`${request.assignedPartner?.firstName || ""} ${request.assignedPartner?.lastName || ""}`.trim() || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'Activated' ? 'bg-green-100 text-green-800' :
                          request.status === 'Invited' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(request.dateSubmitted).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Strategic Partner Dashboard
  if (data.type === 'strategic_partner' && 'partner' in data) {
    return (
      <StrategicPartnerDashboard
        partner={data.partner}
        assignedRequests={data.assignedRequests}
        userName={session.user.name}
      />
    )
  }

  // Legacy fallback
  if (data.type === 'strategic_partner_legacy' && 'partner' in data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Strategic Partner Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{session.user.name}</span>
              <Link href="/api/auth/signout" className="text-[#1E8E5A] hover:text-[#177349] font-semibold">
                Sign Out
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6">
          {/* Partner Info Card */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-600 text-sm">Activation Level</div>
                <div className="text-lg font-semibold">{data.partner.activationLevel}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Slots Used</div>
                <div className="text-lg font-semibold">
                  {data.partner.slotsUsed} / {data.partner.slotsAvailable}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Your Referral Code</div>
                <div className="text-lg font-semibold font-mono bg-gray-100 px-3 py-1 rounded">
                  {data.partner.referralCode}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Your Assigned Requests</h2>
            </div>
            {data.assignedRequests.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No requests assigned yet. You'll be notified when new requests are assigned.
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.assignedRequests.map((request: any) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{`${request.requesterFirstName} ${request.requesterLastName}`}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.requesterEmail}</div>
                          {request.requesterPhone && (
                            <div className="text-sm text-gray-500">{request.requesterPhone}</div>
                          )}
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
                          <button className="text-[#1E8E5A] hover:underline text-sm font-medium">
                            Update Status
                          </button>
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

  return <div>Dashboard type not implemented</div>
}
// Build 1780606042
