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

    const { adminId, confirmText } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    if (confirmText !== 'DELETE') {
      return NextResponse.json({ error: 'Confirmation text must be DELETE' }, { status: 400 })
    }

    // Get admin to check they exist
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: {
        team: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Delete admin account
    // Note: Teams and Strategic Partners are preserved
    await prisma.admin.delete({
      where: { id: adminId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Admin account deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
