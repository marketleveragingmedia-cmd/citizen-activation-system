import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TeamAdminsClient from './TeamAdminsClient'

export default async function TeamAdminsPage() {
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

  // Get all Team Admins (FullSystem tier)
  const teamAdmins = await prisma.admin.findMany({
    where: {
      role: 'TEAM_ADMIN',
      team: {
        tierType: 'FullSystem'
      }
    },
    include: {
      team: {
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: {
      createdDate: 'desc'
    }
  })

  // Calculate stats
  const totalTeamAdmins = teamAdmins.length
  const activeTeamAdmins = teamAdmins.filter(a => a.status === 'Active').length
  const inactiveTeamAdmins = teamAdmins.filter(a => a.status === 'Inactive').length

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Team Admins Management</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
            <Link href="/api/auth/signout" className="text-[#1E8E5A] hover:text-[#177349] font-semibold">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Total Team Admins</div>
            <div className="text-3xl font-bold text-gray-900">{totalTeamAdmins}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Active</div>
            <div className="text-3xl font-bold text-green-600">{activeTeamAdmins}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-600 text-sm mb-2">Inactive</div>
            <div className="text-3xl font-bold text-gray-600">{inactiveTeamAdmins}</div>
          </div>
        </div>

        {/* Team Admins Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Team Admin Accounts</h2>
          </div>

          {teamAdmins.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No Team Admin accounts yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <TeamAdminsClient teamAdmins={teamAdmins} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
