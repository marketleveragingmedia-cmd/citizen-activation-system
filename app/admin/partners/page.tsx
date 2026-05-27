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

  const partners = await prisma.strategicPartner.findMany({
    orderBy: { createdDate: 'desc' },
    include: {
      _count: {
        select: { assignedRequests: true }
      }
    }
  })

  return <PartnersListClient partners={partners} userName={session.user.name} />
}
