import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const partners = await prisma.strategicPartner.findMany({
      orderBy: { firstName: 'asc' }
    })

    return NextResponse.json({ partners })

  } catch (error) {
    console.error('Get partners error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
