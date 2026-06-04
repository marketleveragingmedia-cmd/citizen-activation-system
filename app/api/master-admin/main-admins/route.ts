import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all Main Admins
    const mainAdmins = await prisma.admin.findMany({
      where: {
        role: 'MAIN_ADMIN'
      },
      include: {
        team: true,
        teamsCreated: {
          select: {
            id: true,
            tierType: true
          }
        }
      },
      orderBy: {
        createdDate: 'desc'
      }
    })

    return NextResponse.json({ mainAdmins })

  } catch (error: any) {
    console.error('Error fetching main admins:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
