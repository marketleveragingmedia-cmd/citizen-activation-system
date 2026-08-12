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

    const { founderBetaId } = await request.json()

    if (!founderBetaId) {
      return NextResponse.json({ error: 'Founder Beta ID required' }, { status: 400 })
    }

    // Get founder info before deleting
    const founder = await prisma.founderBeta.findUnique({
      where: { id: founderBetaId }
    })

    if (!founder) {
      return NextResponse.json({ error: 'Founder not found' }, { status: 404 })
    }

    // Delete the founder
    await prisma.founderBeta.delete({
      where: { id: founderBetaId }
    })

    console.log(`✅ Deleted Founder: ${founder.fullName} (${founder.email})`)

    return NextResponse.json({
      success: true,
      message: `Deleted ${founder.fullName}`
    })

  } catch (error) {
    console.error('Delete founder error:', error)
    return NextResponse.json(
      { error: 'Failed to delete founder' },
      { status: 500 }
    )
  }
}
