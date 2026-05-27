import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || (admin.role !== 'MAIN_ADMIN' && admin.role !== 'TEAM_ADMIN' && admin.role !== 'MASTER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get partner with team info
    const partner = await prisma.strategicPartner.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Get all requests assigned to this partner
    const requests = await prisma.request.findMany({
      where: { assignedPartnerId: id },
      orderBy: { dateSubmitted: 'desc' }
    })

    return NextResponse.json({
      partner,
      requests
    })
  } catch (error) {
    console.error('Error fetching partner data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner data' },
      { status: 500 }
    )
  }
}
