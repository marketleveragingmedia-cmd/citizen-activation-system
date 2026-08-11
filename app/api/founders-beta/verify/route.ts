import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Look up Founder Beta by Stripe checkout session ID
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

    // Return Founder Beta data
    return NextResponse.json({
      success: true,
      founderBeta: {
        id: founderBeta.id,
        fullName: founderBeta.fullName,
        email: founderBeta.email,
        phone: founderBeta.phone,
        address1: founderBeta.address1,
        address2: founderBeta.address2,
        city: founderBeta.city,
        state: founderBeta.state,
        zip: founderBeta.zip,
        country: founderBeta.country,
        founderLevel: founderBeta.founderLevel,
        amountPaid: founderBeta.amountPaid,
        paymentStatus: founderBeta.paymentStatus,
        intakeCompleted: founderBeta.intakeCompleted,
        createdAt: founderBeta.createdAt,
      },
    });

  } catch (error: any) {
    console.error('Error verifying Founder Beta:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
