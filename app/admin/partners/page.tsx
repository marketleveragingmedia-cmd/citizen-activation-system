import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PartnersListClient from './PartnersListClient'

export default async function PartnersPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  // Only Main Admin or Master Admin
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

  // Master Admin sees ALL partners, Main Admin sees only THEIR team's partners
  const whereClause = session.user.role === 'MASTER_ADMIN'
    ? {}
    : { teamId: currentAdmin.teamId }

  const partners = await prisma.strategicPartner.findMany({
    where: whereClause,
    orderBy: { createdDate: 'desc' },
    include: {
      _count: {
        select: { assignedRequests: true }
      }
    }
  })

  return <PartnersListClient partners={partners} userName={session.user.name} />
}
