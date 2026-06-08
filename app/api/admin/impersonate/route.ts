import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// POST /api/admin/impersonate - Master Admin view-as system
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentAdmin = await prisma.admin.findUnique({
      where: { id: session.user.id }
    })

    if (!currentAdmin || currentAdmin.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Only Master Admin can impersonate' }, { status: 403 })
    }

    const { targetId, targetType } = await request.json()

    if (!targetId || !targetType) {
      return NextResponse.json({ error: 'Missing targetId or targetType' }, { status: 400 })
    }

    let targetUser: any = null

    if (targetType === 'admin') {
      targetUser = await prisma.admin.findUnique({
        where: { id: targetId },
        include: { team: true }
      })
    } else if (targetType === 'partner') {
      targetUser = await prisma.strategicPartner.findUnique({
        where: { id: targetId },
        include: { team: true }
      })
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Return impersonation data (client will handle redirect)
    return NextResponse.json({
      success: true,
      impersonation: {
        masterAdminId: currentAdmin.id,
        masterAdminName: `${currentAdmin.firstName} ${currentAdmin.lastName}`,
        targetId: targetUser.id,
        targetType,
        targetName: `${targetUser.firstName} ${targetUser.lastName}`,
        targetRole: targetType === 'admin' ? targetUser.role : 'STRATEGIC_PARTNER',
        targetEmail: targetUser.email
      },
      redirectUrl: '/dashboard'
    })
  } catch (error: any) {
    console.error('Impersonation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
