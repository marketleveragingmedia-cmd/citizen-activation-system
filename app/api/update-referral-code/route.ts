import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * Update Referral Code for Strategic Partner
 * POST /api/update-referral-code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Strategic Partners can update their own referral code
    if (session.user.type !== 'partner') {
      return NextResponse.json({ error: 'Forbidden - Strategic Partners only' }, { status: 403 })
    }

    const body = await request.json()
    const { referralCode } = body

    if (!referralCode || !referralCode.trim()) {
      return NextResponse.json({ error: 'Referral Code is required' }, { status: 400 })
    }

    // Update the Strategic Partner's referral code
    await prisma.strategicPartner.update({
      where: { id: session.user.id },
      data: { referralCode: referralCode.trim() }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Referral Code updated successfully'
    })

  } catch (error: any) {
    console.error('Update referral code error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to update Referral Code'
    }, { status: 500 })
  }
}
