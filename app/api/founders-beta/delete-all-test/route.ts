import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is Master Admin
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id }
    })

    if (!admin || admin.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Master Admin only' }, { status: 403 })
    }

    // Delete ALL Founder Beta records (test/demo cleanup)
    const result = await prisma.founderBeta.deleteMany({})

    console.log(`✅ Deleted ${result.count} Founder Beta test record(s)`)

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Deleted ${result.count} test Founder record(s)`
    })

  } catch (error) {
    console.error('Delete test founders error:', error)
    return NextResponse.json(
      { error: 'Failed to delete test founders' },
      { status: 500 }
    )
  }
}
