import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { syncFounderToGlobalControl } from '@/lib/globalcontrol/sync'

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

    const { founderBetaId, skoolAdded } = await request.json()

    if (!founderBetaId || typeof skoolAdded !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Update SKOOL status
    const updated = await prisma.founderBeta.update({
      where: { id: founderBetaId },
      data: {
        skoolCommunityAdded: skoolAdded,
        skoolCommunityAddedAt: skoolAdded ? new Date() : null,
      }
    })

    console.log(`✅ SKOOL status updated for: ${updated.fullName} - ${skoolAdded ? 'Added' : 'Removed'}`)

    // Sync to Global Control (SKOOL community added tag)
    if (skoolAdded) {
      try {
        const contactId = await syncFounderToGlobalControl(updated);
        if (contactId && !updated.globalControlContactId) {
          await prisma.founderBeta.update({
            where: { id: updated.id },
            data: {
              globalControlContactId: contactId,
              globalControlSynced: true,
              globalControlLastSyncedAt: new Date(),
            }
          });
        }
      } catch (syncError) {
        console.error('Global Control sync failed (non-blocking):', syncError);
      }
    }

    return NextResponse.json({
      success: true,
      skoolAdded,
      message: `SKOOL status updated to: ${skoolAdded ? 'Added' : 'Not Added'}`
    })

  } catch (error) {
    console.error('Update SKOOL error:', error)
    return NextResponse.json(
      { error: 'Failed to update SKOOL status' },
      { status: 500 }
    )
  }
}
