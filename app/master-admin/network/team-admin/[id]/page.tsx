import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TeamAdminNetworkViewer from './TeamAdminNetworkViewer'

export default async function TeamAdminNetworkPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const currentAdmin = await prisma.admin.findUnique({
    where: { email: session.user.email }
  })

  if (!currentAdmin || currentAdmin.role !== 'MASTER_ADMIN') {
    redirect('/dashboard')
  }

  // Get the Team Admin's full network
  const teamAdmin = await prisma.admin.findUnique({
    where: { id: params.id },
    include: {
      team: {
        include: {
          createdBy: true,
          strategicPartners: {
            include: {
              assignedRequests: {
                where: { status: 'Activated' }
              }
            }
          }
        }
      }
    }
  })

  if (!teamAdmin || teamAdmin.role !== 'TEAM_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/master-admin/team-admins" className="text-blue-600 hover:underline">
              ← Back to Team Admins
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-red-600 text-lg">Team Admin not found</p>
          </div>
        </div>
      </div>
    )
  }

  const partners = teamAdmin.team?.strategicPartners || []
  const totalActivations = partners.reduce((sum, p) => sum + p.assignedRequests.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/master-admin/team-admins" className="text-blue-600 hover:underline text-sm">
              ← Back to Team Admins
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              {teamAdmin.firstName} {teamAdmin.lastName}'s Network
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {teamAdmin.email} • Team Admin
            </p>
            {teamAdmin.team?.createdBy && (
              <p className="text-sm text-blue-600 mt-1">
                Connected by: {teamAdmin.team.createdBy.firstName} {teamAdmin.team.createdBy.lastName}
              </p>
            )}
          </div>
          <Link href="/dashboard" className="text-gray-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Strategic Partners</div>
            <div className="text-2xl font-bold text-[#1E8E5A]">{partners.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Total Activations</div>
            <div className="text-2xl font-bold text-[#1E8E5A]">{totalActivations}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Average per Partner</div>
            <div className="text-2xl font-bold text-gray-900">
              {partners.length > 0 ? (totalActivations / partners.length).toFixed(1) : '0'}
            </div>
          </div>
        </div>

        {/* Network Tree */}
        <div className="bg-white rounded-lg shadow p-6">
          <TeamAdminNetworkViewer partners={partners} />
        </div>
      </div>
    </div>
  )
}
