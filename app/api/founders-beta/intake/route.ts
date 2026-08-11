import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      fullName,
      email,
      phone,
      address1,
      address2,
      city,
      state,
      zip,
      country,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
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
        { status: 404 }
      );
    }

    // Update with intake form data
    const updated = await prisma.founderBeta.update({
      where: {
        id: founderBeta.id,
      },
      data: {
        fullName: fullName || founderBeta.fullName,
        email: email || founderBeta.email,
        phone: phone || founderBeta.phone,
        address1: address1 || founderBeta.address1,
        address2: address2 || founderBeta.address2,
        city: city || founderBeta.city,
        state: state || founderBeta.state,
        zip: zip || founderBeta.zip,
        country: country || founderBeta.country,
        intakeCompleted: true,
        intakeCompletedAt: new Date(),
      },
    });

    console.log('✅ Founder Beta intake completed:', updated.id);

    return NextResponse.json({
      success: true,
      founderBetaId: updated.id,
      founderLevel: updated.founderLevel,
    });

  } catch (error: any) {
    console.error('Error processing intake:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
