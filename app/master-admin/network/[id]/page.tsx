import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import NetworkViewer from './NetworkViewer'

export default async function MasterAdminNetworkPage({ params }: { params: { id: string } }) {
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

  // Get the target admin's full network
  const targetAdmin = await prisma.admin.findUnique({
    where: { id: params.id },
    include: {
      team: true,
      teamsCreated: {
        include: {
          admins: {
            include: {
              team: true
            }
          },
          strategicPartners: {
            include: {
              assignedRequests: {
                where: { status: 'Activated' }
              }
            }
          }
        },
        orderBy: { createdDate: 'desc' }
      }
    }
  })

  if (!targetAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/master-admin/main-admins" className="text-blue-600 hover:underline">
              ← Back to Main Admins
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-red-600 text-lg">Admin not found</p>
          </div>
        </div>
      </div>
    )
  }

  const teamAdmins = targetAdmin.teamsCreated.filter(t => t.tierType === 'FullSystem')
  const orgAdmins = targetAdmin.teamsCreated.filter(t => t.tierType === 'SoloOrg')
  const totalPartners = targetAdmin.teamsCreated.reduce((sum, t) => sum + t.strategicPartners.length, 0)
  const totalActivations = targetAdmin.teamsCreated.reduce((sum, t) => 
    sum + t.strategicPartners.reduce((s, p) => s + p.assignedRequests.length, 0), 0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link href="/master-admin/main-admins" className="text-blue-600 hover:underline text-sm">
              ← Back to Main Admins
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              {targetAdmin.firstName} {targetAdmin.lastName}'s Network
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {targetAdmin.email}
              {targetAdmin.isFounder && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⭐ Founder
                </span>
              )}
            </p>
          </div>
          <Link href="/dashboard" className="text-gray-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Team Admins</div>
            <div className="text-2xl font-bold text-gray-900">{teamAdmins.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Organization Admins</div>
            <div className="text-2xl font-bold text-gray-900">{orgAdmins.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Strategic Partners</div>
            <div className="text-2xl font-bold text-[#1E8E5A]">{totalPartners}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-1">Total Activations</div>
            <div className="text-2xl font-bold text-[#1E8E5A]">{totalActivations}</div>
          </div>
        </div>

        {/* Network Tree */}
        <div className="bg-white rounded-lg shadow p-6">
          <NetworkViewer admin={targetAdmin} />
        </div>
      </div>
    </div>
  )
}
