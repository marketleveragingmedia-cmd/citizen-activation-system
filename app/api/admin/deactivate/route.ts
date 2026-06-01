import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/deactivate
 * 
 * Deactivates an admin account
 * - Sets status to Inactive
 * - Blocks subdomain (no new requests)
 * - Keeps Strategic Partners assigned (cannot be reassigned)
 * - Preserves request history for Main Admin visibility
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Master Admin and Main Admin can deactivate others
    if (session.user.role !== 'MASTER_ADMIN' && session.user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Only Master Admin or Main Admin can deactivate accounts' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { adminId, reason } = body

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    // Get the admin to deactivate
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

    // Prevent deactivating Master Admin
    if (admin.role === 'MASTER_ADMIN') {
      return NextResponse.json({ 
        error: 'Cannot deactivate Master Admin' 
      }, { status: 403 })
    }

    // Check if Main Admin trying to deactivate another Main Admin
    if (session.user.role === 'MAIN_ADMIN' && admin.role === 'MAIN_ADMIN' && admin.id !== session.user.id) {
      return NextResponse.json({ 
        error: 'Main Admins cannot deactivate other Main Admins' 
      }, { status: 403 })
    }

    // Deactivate the admin
    const deactivatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        status: 'Inactive'
        // Note: subdomain remains in database for historical tracking
        // Middleware will block requests based on status
      }
    })

    // Count Strategic Partners that remain with deactivated admin
    const partnerCount = admin.team?.strategicPartners?.length || 0

    return NextResponse.json({
      success: true,
      message: 'Admin deactivated successfully',
      admin: {
        id: deactivatedAdmin.id,
        email: deactivatedAdmin.email,
        name: `${deactivatedAdmin.firstName} ${deactivatedAdmin.lastName}`,
        subdomain: deactivatedAdmin.subdomain,
        status: deactivatedAdmin.status
      },
      impact: {
        subdomainBlocked: true,
        strategicPartnersRetained: partnerCount,
        note: `${partnerCount} Strategic Partners remain assigned to this admin and cannot be reassigned by others.`
      }
    })

  } catch (error: any) {
    console.error('Admin deactivation error:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate admin', details: error.message },
      { status: 500 }
    )
  }
}
