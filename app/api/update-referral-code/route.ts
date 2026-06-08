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

    const body = await request.json()
    const { referralCode } = body

    if (!referralCode || !referralCode.trim()) {
      return NextResponse.json({ error: 'Strategic Partner Referral Code is required' }, { status: 400 })
    }

    const trimmedCode = referralCode.trim()

    // Only Strategic Partners can use this endpoint
    if (session.user.type !== 'partner') {
      return NextResponse.json({ error: 'Only Strategic Partners can update referral codes via this endpoint' }, { status: 403 })
    }

    // Check if Strategic Partner Referral Code is already used by another partner
    const existing = await prisma.strategicPartner.findFirst({
      where: {
        referralCode: trimmedCode,
        id: { not: session.user.id }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'This referral code is already in use by another Strategic Partner' }, { status: 400 })
    }

    // Update the Strategic Partner's referral code
    await prisma.strategicPartner.update({
      where: { id: session.user.id },
      data: { referralCode: trimmedCode }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update Strategic Partner Referral Code error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
