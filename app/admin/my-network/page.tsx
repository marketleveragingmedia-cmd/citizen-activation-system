import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import MyNetworkClient from './MyNetworkClient'

export default async function MyNetworkPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
    include: {
      team: {
        include: {
          createdBy: true
        }
      }
    }
  })

  if (!admin) {
    redirect('/login')
  }

  // Only Main Admin, Team Admin, and Org Admin can access this page
  if (admin.role === 'MASTER_ADMIN') {
    // Master Admin should use the network viewer pages instead
    redirect('/dashboard')
  }

  let network: any = {}
  let createdBy: any = null

  if (admin.role === 'MAIN_ADMIN') {
    // Main Admin: Show their created Team/Org Admins
    const createdTeams = await prisma.team.findMany({
      where: { createdByAdminId: admin.id },
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
    })

    network = {
      createdTeams,
      teamAdmins: createdTeams.filter(t => t.tierType === 'FullSystem'),
      orgAdmins: createdTeams.filter(t => t.tierType === 'SoloOrg'),
      totalTeamAdmins: createdTeams.filter(t => t.tierType === 'FullSystem').length,
      totalOrgAdmins: createdTeams.filter(t => t.tierType === 'SoloOrg').length,
      totalPartners: createdTeams.reduce((sum, t) => sum + t.strategicPartners.length, 0),
      totalActivations: createdTeams.reduce((sum, t) => 
        sum + t.strategicPartners.reduce((s, p) => s + p.assignedRequests.length, 0), 0
      )
    }
  } else if (admin.role === 'TEAM_ADMIN' || admin.role === 'ORG_ADMIN') {
    // Team/Org Admin: Show their Strategic Partners
    const team = await prisma.team.findUnique({
      where: { id: admin.teamId! },
      include: {
        strategicPartners: {
          include: {
            assignedRequests: {
              where: { status: 'Activated' }
            }
          }
        },
        createdBy: true
      }
    })

    network = {
      team,
      partners: team?.strategicPartners || [],
      totalPartners: team?.strategicPartners.length || 0,
      totalActivations: team?.strategicPartners.reduce((sum, p) => sum + p.assignedRequests.length, 0) || 0
    }
    
    createdBy = team?.createdBy || null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Network</h1>
            <p className="text-sm text-gray-600 mt-1">
              {admin.firstName} {admin.lastName} • {admin.role.replace('_', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
              ← Back to Dashboard
            </Link>
            <Link href="/api/auth/signout" className="text-red-600 hover:underline text-sm">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <MyNetworkClient
          admin={admin}
          network={network}
          createdBy={createdBy}
        />
      </div>
    </div>
  )
}
