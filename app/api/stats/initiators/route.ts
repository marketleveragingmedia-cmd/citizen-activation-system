import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/stats/initiators
 * 
 * Get stats for all initiators (admins with subdomains)
 * Shows request counts, delayed counts, etc.
 * Main Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'MAIN_ADMIN' && session.user.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Only Main Admin can view initiator stats' 
      }, { status: 403 })
    }

    // Get all admins with subdomains
    const admins = await prisma.admin.findMany({
      where: {
        subdomain: { not: null }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        subdomain: true,
        role: true,
        status: true
      }
    })

    // Get request counts for each initiator
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const stats = await Promise.all(
      admins.map(async (admin) => {
        const [totalRequests, activeRequests, delayedRequests] = await Promise.all([
          // Total requests from this initiator
          prisma.request.count({
            where: { initiatorId: admin.id }
          }),
          // Active (Assigned) requests
          prisma.request.count({
            where: { 
              initiatorId: admin.id,
              status: 'Assigned'
            }
          }),
          // Delayed (3+ days assigned)
          prisma.request.count({
            where: {
              initiatorId: admin.id,
              status: 'Assigned',
              dateAssigned: { lt: threeDaysAgo }
            }
          })
        ])

        return {
          admin: {
            id: admin.id,
            name: `${admin.firstName} ${admin.lastName}`,
            subdomain: admin.subdomain,
            role: admin.role,
            status: admin.status
          },
          stats: {
            totalRequests,
            activeRequests,
            delayedRequests,
            hasDelayed: delayedRequests > 0
          }
        }
      })
    )

    // Sort by total requests desc
    stats.sort((a, b) => b.stats.totalRequests - a.stats.totalRequests)

    return NextResponse.json({
      initiators: stats,
      count: stats.length,
      summary: {
        totalInitiators: stats.length,
        activeInitiators: stats.filter(s => s.admin.status === 'Active').length,
        initiatorsWithDelayed: stats.filter(s => s.stats.hasDelayed).length
      }
    })

  } catch (error: any) {
    console.error('Get initiator stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
  }
}
