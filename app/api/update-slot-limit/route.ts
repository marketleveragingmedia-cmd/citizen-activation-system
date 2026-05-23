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

    const updated = await prisma.strategicPartner.update({
      where: { id: partnerId },
      data: { customSlotLimit: customSlotLimit || null }
    })

    return NextResponse.json({ 
      success: true, 
      partner: {
        id: updated.id,
        name: `${updated.firstName} ${updated.lastName}`,
        customSlotLimit: updated.customSlotLimit
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
