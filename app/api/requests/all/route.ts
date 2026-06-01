import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/requests/all?status=Assigned&initiatorId=xyz&limit=50
 * 
 * Get all requests across the system (Main Admin only)
 * Shows initiator, can filter, but can only reassign owned requests
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Main Admin can see all requests
    if (session.user.role !== 'MAIN_ADMIN' && session.user.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Only Main Admin can view all requests' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // Optional filter
    const initiatorId = searchParams.get('initiatorId') // Optional filter
    const delayed = searchParams.get('delayed') === 'true' // Show only 3+ day delayed
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query conditions
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (initiatorId) {
      where.initiatorId = initiatorId
    }

    if (delayed) {
      // Requests assigned 3+ days ago with no progress (still in Assigned status)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      
      where.status = 'Assigned'
      where.dateAssigned = {
        lt: threeDaysAgo
      }
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        assignedPartner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            referralCode: true
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            adminId: true
          }
        }
      },
      orderBy: {
        dateSubmitted: 'desc'
      },
      take: limit
    })

    // Get initiator info for each request
    const initiatorIds = [...new Set(requests.map(r => r.initiatorId).filter(Boolean))] as string[]
    
    const initiators = await prisma.admin.findMany({
      where: {
        id: { in: initiatorIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        subdomain: true,
        role: true
      }
    })

    const initiatorsMap = new Map(initiators.map(i => [i.id, i]))

    // Format response
    const formattedRequests = requests.map(req => {
      const initiator = req.initiatorId ? initiatorsMap.get(req.initiatorId) : null
      const daysSinceSubmitted = Math.floor(
        (Date.now() - new Date(req.dateSubmitted).getTime()) / (1000 * 60 * 60 * 24)
      )
      const isDelayed = req.status === 'Assigned' && daysSinceSubmitted >= 3

      return {
        id: req.id,
        requester: {
          firstName: req.requesterFirstName,
          lastName: req.requesterLastName,
          email: req.requesterEmail,
          phone: req.requesterPhone
        },
        assignedPartner: req.assignedPartner ? {
          id: req.assignedPartner.id,
          name: `${req.assignedPartner.firstName} ${req.assignedPartner.lastName}`,
          email: req.assignedPartner.email,
          referralCode: req.assignedPartner.referralCode
        } : null,
        initiator: initiator ? {
          id: initiator.id,
          name: `${initiator.firstName} ${initiator.lastName}`,
          subdomain: initiator.subdomain,
          role: initiator.role
        } : null,
        canReassign: req.initiatorId === session.user.id || !req.initiatorId, // Can only reassign if you're the initiator
        status: req.status,
        dateSubmitted: req.dateSubmitted,
        dateAssigned: req.dateAssigned,
        daysSinceSubmitted,
        isDelayed,
        teamName: req.team.name
      }
    })

    return NextResponse.json({
      requests: formattedRequests,
      count: formattedRequests.length,
      filters: {
        status,
        initiatorId,
        delayed
      }
    })

  } catch (error: any) {
    console.error('Get all requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests', details: error.message },
      { status: 500 }
    )
  }
}
