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

    const { adminId } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    // Get current admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Toggle status
    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active'

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        status: newStatus
      }
    })

    return NextResponse.json({ 
      success: true, 
      admin: updatedAdmin,
      newStatus
    })

  } catch (error: any) {
    console.error('Error toggling admin status:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
