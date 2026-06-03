import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * Deactivate an admin account
 * POST /api/admin/deactivate
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only Master Admin can deactivate accounts
    if (!session || session.user.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Master Admin only' 
      }, { status: 403 })
    }

    const body = await req.json()
    const { adminId } = body

    if (!adminId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin ID required' 
      }, { status: 400 })
    }

    // Get the admin to deactivate
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin not found' 
      }, { status: 404 })
    }

    // Cannot deactivate Master Admin
    if (admin.role === 'MASTER_ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot deactivate Master Admin accounts' 
      }, { status: 400 })
    }

    // Deactivate the admin
    await prisma.admin.update({
      where: { id: adminId },
      data: { status: 'Inactive' }
    })

    // If admin has a team, deactivate it too
    if (admin.teamId) {
      await prisma.team.update({
        where: { id: admin.teamId },
        data: { status: 'Inactive' }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account deactivated successfully'
    })

  } catch (error: any) {
    console.error('Deactivate admin error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
