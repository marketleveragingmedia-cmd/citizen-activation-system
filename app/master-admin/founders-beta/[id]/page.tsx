import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import FounderProfileClient from './FounderProfileClient'

export const metadata: Metadata = {
  title: 'Founder Profile',
}

export default async function FounderProfilePage({ params }: { params: { id: string } }) {
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

  // Get Founder by ID
  const founder = await prisma.founderBeta.findUnique({
    where: { id: params.id }
  })

  if (!founder) {
    redirect('/master-admin/founders-beta')
  }

  return <FounderProfileClient founder={founder} />
}
