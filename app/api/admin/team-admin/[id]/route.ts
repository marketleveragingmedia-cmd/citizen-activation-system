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

    if (!admin || admin.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get team admin with team info
    const teamAdmin = await prisma.admin.findUnique({
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

    if (!teamAdmin || teamAdmin.role !== 'TEAM_ADMIN') {
      return NextResponse.json({ error: 'Team Admin not found' }, { status: 404 })
    }

    // Get all strategic partners under this team admin
    const partners = await prisma.strategicPartner.findMany({
      where: { teamId: teamAdmin.teamId || undefined },
      orderBy: { lastName: 'asc' }
    })

    // Get all requests for this team
    const requests = await prisma.request.findMany({
      where: { teamId: teamAdmin.teamId || undefined },
      include: {
        assignedPartner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { dateSubmitted: 'desc' }
    })

    return NextResponse.json({
      teamAdmin: {
        id: teamAdmin.id,
        email: teamAdmin.email,
        firstName: teamAdmin.firstName,
        lastName: teamAdmin.lastName,
        role: teamAdmin.role,
        team: teamAdmin.team
      },
      partners,
      requests
    })
  } catch (error) {
    console.error('Error fetching team admin data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team admin data' },
      { status: 500 }
    )
  }
}
