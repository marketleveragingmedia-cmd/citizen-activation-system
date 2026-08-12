import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { syncFounderToGlobalControl } from '@/lib/globalcontrol/sync'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Find Founder by email
    const founder = await prisma.founderBeta.findUnique({
      where: { email }
    })

    if (!founder) {
      return NextResponse.json(
        { error: 'Founder not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Update invitation request status
    const updated = await prisma.founderBeta.update({
      where: { id: founder.id },
      data: {
        invitationRequestCompleted: true,
        invitationRequestCompletedAt: new Date(),
      }
    })

    console.log(`✅ Invitation Request completed for: ${founder.fullName}`)

    // Sync to Global Control (invitation request complete tag)
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

    return NextResponse.json({
      success: true,
      founderId: updated.id,
      message: 'Invitation Request marked complete'
    }, { headers: corsHeaders })

  } catch (error: any) {
    console.error('Error marking invitation request complete:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
