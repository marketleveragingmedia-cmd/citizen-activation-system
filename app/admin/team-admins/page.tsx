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

  // Only Main Admin or Master Admin can see all Team Admins
  if (session.user.role !== 'MAIN_ADMIN' && session.user.role !== 'MASTER_ADMIN') {
    redirect('/dashboard')
  }

  const teams = await prisma.team.findMany({
    where: {
      tierType: 'FullSystem', // Team Admins (not Org Admins)
      status: 'Active'
    },
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
