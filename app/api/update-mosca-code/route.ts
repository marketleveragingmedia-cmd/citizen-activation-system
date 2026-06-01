import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * Update MOSCA Referral Code for Strategic Partner
 * POST /api/update-mosca-code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Strategic Partners can update their own MOSCA code
    if (session.user.type !== 'partner') {
      return NextResponse.json({ error: 'Forbidden - Strategic Partners only' }, { status: 403 })
    }

    const body = await request.json()
    const { moscaReferralCode } = body

    if (!moscaReferralCode || !moscaReferralCode.trim()) {
      return NextResponse.json({ error: 'MOSCA Referral Code is required' }, { status: 400 })
    }

    // Update the Strategic Partner's referral code
    await prisma.strategicPartner.update({
      where: { id: session.user.id },
      data: { referralCode: moscaReferralCode.trim() }
    })

    return NextResponse.json({ 
      success: true,
      message: 'MOSCA Referral Code updated successfully'
    })

  } catch (error: any) {
    console.error('Update MOSCA code error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to update MOSCA Referral Code'
    }, { status: 500 })
  }
}
