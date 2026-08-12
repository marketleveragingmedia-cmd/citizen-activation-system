import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import FoundersBetaClient from './FoundersBetaClient'

export const metadata: Metadata = {
  title: 'Founders Beta',
}

export default async function FoundersBetaPage() {
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

  // Get all Founders-Beta members
  const foundersBeta = await prisma.founderBeta.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculate stats
  const totalFounders = foundersBeta.length
  const citizenCount = foundersBeta.filter(f => f.founderLevel.includes('Citizen')).length
  const enterpriseCount = foundersBeta.filter(f => f.founderLevel.includes('Enterprise')).length
  const totalRevenue = foundersBeta.reduce((sum, f) => sum + (f.amountPaid || 0), 0)
  const intakeComplete = foundersBeta.filter(f => f.intakeCompleted).length
  const casAccountsCreated = foundersBeta.filter(f => f.casAccountCreated).length

  const stats = {
    totalFounders,
    citizenCount,
    enterpriseCount,
    totalRevenue: totalRevenue / 100, // Convert cents to dollars
    intakeComplete,
    casAccountsCreated,
  }

  return (
    <FoundersBetaClient 
      founders={foundersBeta} 
      stats={stats}
    />
  )
}
