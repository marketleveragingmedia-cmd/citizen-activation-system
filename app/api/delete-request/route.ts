import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Main Admin can delete
    if (session.user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json({ error: 'Missing request ID' }, { status: 400 })
    }

    // Get the request to free up the Strategic Partner slot if needed
    const req = await prisma.request.findUnique({
      where: { id: requestId }
    })

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Delete the request
    await prisma.request.delete({
      where: { id: requestId }
    })

    // Free up Strategic Partner slot if assigned and not activated
    if (req.assignedPartnerId && req.status !== 'Activated') {
      const partner = await prisma.strategicPartner.findUnique({
        where: { id: req.assignedPartnerId }
      })

      if (partner && partner.slotsUsed > 0) {
        const newSlotsUsed = partner.slotsUsed - 1
        await prisma.strategicPartner.update({
          where: { id: req.assignedPartnerId },
          data: {
            slotsUsed: newSlotsUsed,
            status: newSlotsUsed < 3 ? 'Active' : 'Full'
          }
        })
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
