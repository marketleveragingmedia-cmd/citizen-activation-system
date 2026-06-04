import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    })

    if (!currentAdmin || currentAdmin.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { adminId, firstName, lastName, email, phone } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        firstName,
        lastName,
        email,
        phone
      }
    })

    return NextResponse.json({ 
      success: true, 
      admin: updatedAdmin 
    })

  } catch (error: any) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
