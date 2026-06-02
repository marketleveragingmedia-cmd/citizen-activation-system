import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TeamAdminsListClient from './TeamAdminsListClient'

export default async function TeamAdminsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  // Only Main Admin or Master Admin can see Team Admins
  if (session.user.role !== 'MAIN_ADMIN' && session.user.role !== 'MASTER_ADMIN') {
    redirect('/dashboard')
  }

  // Get current admin's teamId
  const currentAdmin = await prisma.admin.findUnique({
    where: { id: session.user.id },
    select: { teamId: true, role: true }
  })

  if (!currentAdmin) {
    redirect('/dashboard')
  }

  // Master Admin sees ALL teams, Main Admin sees only their own network
  const whereClause = session.user.role === 'MASTER_ADMIN'
    ? {
        tierType: 'FullSystem', // Team Admins (not Org Admins)
        status: 'Active'
      }
    : {
        tierType: 'FullSystem',
        status: 'Active',
        parentTeamId: currentAdmin.teamId // Only this Main Admin's Team Admins
      }

  const teams = await prisma.team.findMany({
    where: whereClause,
    orderBy: { createdDate: 'desc' },
    include: {
      admins: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          role: true
        }
      },
      _count: {
        select: { 
          requests: true,
          strategicPartners: true 
        }
      }
    }
  })

  return <TeamAdminsListClient teams={teams} userName={session.user.name} />
}
