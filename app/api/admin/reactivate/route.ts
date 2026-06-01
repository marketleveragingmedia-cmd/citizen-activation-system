import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/reactivate
 * 
 * Reactivates a deactivated admin account
 * - Sets status back to Active
 * - Subdomain becomes functional again
 * - All Strategic Partners and history remain intact
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Master Admin can reactivate
    if (session.user.role !== 'MASTER_ADMIN' && session.user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Only Master Admin or Main Admin can reactivate accounts' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { adminId } = body

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    // Get the admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: {
        team: {
          include: {
            strategicPartners: {
              where: { status: 'Active' }
            }
          }
        }
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    if (admin.status !== 'Inactive') {
      return NextResponse.json({ 
        error: 'Admin is already active' 
      }, { status: 400 })
    }

    // Reactivate
    const reactivatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        status: 'Active'
      }
    })

    const partnerCount = admin.team?.strategicPartners?.length || 0

    return NextResponse.json({
      success: true,
      message: 'Admin reactivated successfully',
      admin: {
        id: reactivatedAdmin.id,
        email: reactivatedAdmin.email,
        name: `${reactivatedAdmin.firstName} ${reactivatedAdmin.lastName}`,
        subdomain: reactivatedAdmin.subdomain,
        status: reactivatedAdmin.status
      },
      impact: {
        subdomainActive: true,
        strategicPartners: partnerCount,
        note: `Subdomain ${reactivatedAdmin.subdomain}.citizenactivation.com is now active. ${partnerCount} Strategic Partners restored.`
      }
    })

  } catch (error: any) {
    console.error('Admin reactivation error:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate admin', details: error.message },
      { status: 500 }
    )
  }
}
