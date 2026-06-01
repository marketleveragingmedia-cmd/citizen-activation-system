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
    const { firstName, lastName, phone, referralCode } = body

    if (!firstName || !lastName || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (session.user.type === 'partner') {
      // Prepare update data
      const updateData: any = { firstName, lastName, phone }

      // Only update referralCode if provided (backend support for manual corrections)
      if (referralCode) {
        // Check if referral code is already used by another partner
        const existing = await prisma.strategicPartner.findFirst({
          where: {
            referralCode,
            id: { not: session.user.id }
          }
        })

        if (existing) {
          return NextResponse.json({ error: 'Referral code already in use' }, { status: 400 })
        }

        updateData.referralCode = referralCode
      }

      await prisma.strategicPartner.update({
        where: { id: session.user.id },
        data: updateData
      })
    } else if (session.user.type === 'admin') {
      // Prepare update data for admin
      const updateData: any = { firstName, lastName, phone }

      // Only update referralCode if provided (backend support for manual corrections)
      if (referralCode) {
        // Check if referral code is already used by another admin
        const existing = await prisma.admin.findFirst({
          where: {
            referralCode,
            id: { not: session.user.id }
          }
        })

        if (existing) {
          return NextResponse.json({ error: 'Referral code already in use' }, { status: 400 })
        }

        updateData.referralCode = referralCode
      }

      await prisma.admin.update({
        where: { id: session.user.id },
        data: updateData
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
