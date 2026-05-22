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

    // Only Main Admin can edit Strategic Partners
    if (session.user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { partnerId, firstName, lastName, phone, referralCode, activationLevel } = body

    if (!partnerId) {
      return NextResponse.json({ error: 'Missing partner ID' }, { status: 400 })
    }

    const partner = await prisma.strategicPartner.findUnique({
      where: { id: partnerId }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Strategic Partner not found' }, { status: 404 })
    }

    // Check if referral code already exists (if changed)
    if (referralCode && referralCode !== partner.referralCode) {
      const existingCode = await prisma.strategicPartner.findUnique({
        where: { referralCode }
      })

      if (existingCode) {
        return NextResponse.json({ error: 'Referral code already exists' }, { status: 400 })
      }
    }

    // Update partner
    const updatedPartner = await prisma.strategicPartner.update({
      where: { id: partnerId },
      data: {
        firstName: firstName || partner.firstName,
        lastName: lastName || partner.lastName,
        phone: phone || partner.phone,
        referralCode: referralCode || partner.referralCode,
        activationLevel: activationLevel || partner.activationLevel
      }
    })

    return NextResponse.json({ success: true, partner: updatedPartner })

  } catch (error) {
    console.error('Edit partner error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
