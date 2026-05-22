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
      if (!referralCode) {
        return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
      }

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

      await prisma.strategicPartner.update({
        where: { id: session.user.id },
        data: { firstName, lastName, phone, referralCode }
      })
    } else if (session.user.type === 'admin') {
      await prisma.admin.update({
        where: { id: session.user.id },
        data: { firstName, lastName }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
