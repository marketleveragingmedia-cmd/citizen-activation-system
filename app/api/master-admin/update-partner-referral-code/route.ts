import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Master Admin can use this endpoint
    if (session.user.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Master Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { partnerId, referralCode } = body

    if (!partnerId || !referralCode) {
      return NextResponse.json({ error: 'Partner ID and Strategic Partner Referral Code are required' }, { status: 400 })
    }

    const trimmedCode = referralCode.trim()

    if (!trimmedCode) {
      return NextResponse.json({ error: 'Strategic Partner Referral Code cannot be empty' }, { status: 400 })
    }

    // Check if the partner exists
    const partner = await prisma.strategicPartner.findUnique({
      where: { id: partnerId }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Strategic Partner not found' }, { status: 404 })
    }

    // Check if Strategic Partner Referral Code is already used by another partner
    const existing = await prisma.strategicPartner.findFirst({
      where: {
        referralCode: trimmedCode,
        id: { not: partnerId }
      }
    })

    if (existing) {
      return NextResponse.json({ 
        error: `This Strategic Partner Referral Code is already in use by ${existing.firstName} ${existing.lastName} (${existing.email})` 
      }, { status: 400 })
    }

    // Also check if it's used by an admin
    const adminUsing = await prisma.admin.findFirst({
      where: { referralCode: trimmedCode }
    })

    if (adminUsing) {
      return NextResponse.json({ 
        error: `This Strategic Partner Referral Code is already in use by admin ${adminUsing.firstName} ${adminUsing.lastName} (${adminUsing.email})` 
      }, { status: 400 })
    }

    // Update the Strategic Partner's referral code
    await prisma.strategicPartner.update({
      where: { id: partnerId },
      data: { referralCode: trimmedCode }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Master Admin update Strategic Partner Referral Code error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
