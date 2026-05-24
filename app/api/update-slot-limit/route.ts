import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify Main Admin or Team Admin
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || (admin.role !== 'MAIN_ADMIN' && admin.role !== 'TEAM_ADMIN')) {
      return NextResponse.json({ error: 'Only admins can update slot limits' }, { status: 403 })
    }

    const { partnerId, customSlotLimit } = await req.json()

    // Get current partner to check slots
    const partner = await prisma.strategicPartner.findUnique({
      where: { id: partnerId }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Calculate new status based on updated slot limit
    const newLimit = customSlotLimit || 3
    const newStatus = partner.slotsUsed >= newLimit ? 'Full' : 'Active'

    console.log('[update-slot-limit]', {
      partnerId,
      slotsUsed: partner.slotsUsed,
      oldLimit: partner.customSlotLimit || partner.slotsAvailable,
      newLimit,
      oldStatus: partner.status,
      newStatus
    })

    const updated = await prisma.strategicPartner.update({
      where: { id: partnerId },
      data: { 
        customSlotLimit: customSlotLimit || null,
        status: newStatus
      }
    })

    return NextResponse.json({ 
      success: true, 
      partner: {
        id: updated.id,
        name: `${updated.firstName} ${updated.lastName}`,
        slotsUsed: updated.slotsUsed,
        customSlotLimit: updated.customSlotLimit,
        status: updated.status
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
