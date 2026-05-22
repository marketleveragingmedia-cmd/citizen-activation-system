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

    // Only Main Admin
    if (session.user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { partnerId, status } = body

    if (!partnerId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await prisma.strategicPartner.update({
      where: { id: partnerId },
      data: { status: status as any }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Toggle partner status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
