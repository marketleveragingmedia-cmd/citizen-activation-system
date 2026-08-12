import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { syncFounderToGlobalControl } from '@/lib/globalcontrol/sync';

const prisma = new PrismaClient();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      fullName,
      companyName,
      email,
      phone,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      subdomainOption1,
      subdomainOption2,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find existing Founder Beta record
    const founderBeta = await prisma.founderBeta.findUnique({
      where: {
        stripeCheckoutSessionId: sessionId,
      },
    });

    if (!founderBeta) {
      return NextResponse.json(
        { error: 'Founder Beta record not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Update with intake form data
    const updated = await prisma.founderBeta.update({
      where: {
        id: founderBeta.id,
      },
      data: {
        fullName: fullName || founderBeta.fullName,
        companyName: companyName || null,
        email: email || founderBeta.email,
        phone: phone || founderBeta.phone,
        address1: address1 || founderBeta.address1,
        address2: address2 || founderBeta.address2,
        city: city || founderBeta.city,
        state: state || founderBeta.state,
        zip: zip || founderBeta.zip,
        country: country || founderBeta.country,
        subdomainOption1: subdomainOption1 ? subdomainOption1.toLowerCase().trim() : null,
        subdomainOption2: subdomainOption2 ? subdomainOption2.toLowerCase().trim() : null,
        intakeCompleted: true,
        intakeCompletedAt: new Date(),
      },
    });

    console.log('✅ Founder Beta intake completed:', updated.id);

    // Sync to Global Control (intake complete tag)
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
      founderBetaId: updated.id,
      founderLevel: updated.founderLevel,
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('Error processing intake:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  } finally {
    await prisma.$disconnect();
  }
}
