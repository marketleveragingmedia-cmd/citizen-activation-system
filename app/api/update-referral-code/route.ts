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

    // Only Strategic Partners can update their own referral code
    if (session.user.type !== 'partner') {
      return NextResponse.json({ error: 'Only Strategic Partners can update referral codes' }, { status: 403 })
    }

    const body = await request.json()
    const { referralCode } = body

    if (!referralCode || !referralCode.trim()) {
      return NextResponse.json({ error: 'Referral Code is required' }, { status: 400 })
    }

    const cleanCode = referralCode.trim().toUpperCase()

    // Check if referral code already exists (it must be unique)
    const existingPartner = await prisma.strategicPartner.findFirst({
      where: {
        referralCode: cleanCode,
        id: { not: session.user.id } // Allow user to keep their own code
      }
    })

    if (existingPartner) {
      return NextResponse.json({ error: 'This Referral Code is already in use by another Strategic Partner' }, { status: 400 })
    }

    // Update the Strategic Partner's referral code
    await prisma.strategicPartner.update({
      where: { id: session.user.id },
      data: { referralCode: cleanCode }
    })

    return NextResponse.json({ success: true, message: 'Referral Code updated successfully' })

  } catch (error) {
    console.error('Update referral code error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
