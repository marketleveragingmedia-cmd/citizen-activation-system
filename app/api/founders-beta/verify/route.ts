import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

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
    let founderBeta = await prisma.founderBeta.findUnique({
      where: {
        stripeCheckoutSessionId: sessionId,
      },
    });

    if (!founderBeta) {
      return NextResponse.json(
        { error: 'Founder Beta record not found', verified: false },
        { status: 404 }
      );
    }

    // If payment is still pending, check Stripe for update
    if (founderBeta.paymentStatus === 'pending') {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
          // Update record with payment completion
          founderBeta = await prisma.founderBeta.update({
            where: { id: founderBeta.id },
            data: {
              fullName: session.customer_details?.name || founderBeta.fullName,
              email: session.customer_details?.email || founderBeta.email,
              phone: session.customer_details?.phone || founderBeta.phone,
              address1: session.customer_details?.address?.line1 || founderBeta.address1,
              address2: session.customer_details?.address?.line2 || founderBeta.address2,
              city: session.customer_details?.address?.city || founderBeta.city,
              state: session.customer_details?.address?.state || founderBeta.state,
              zip: session.customer_details?.address?.postal_code || founderBeta.zip,
              country: session.customer_details?.address?.country || founderBeta.country,
              stripeCustomerId: session.customer as string || founderBeta.stripeCustomerId,
              stripePaymentIntentId: session.payment_intent as string || founderBeta.stripePaymentIntentId,
              paymentStatus: 'paid',
            },
          });
          console.log('✅ Payment confirmed and record updated:', founderBeta.id);
        } else {
          return NextResponse.json(
            { error: 'Payment not yet completed', verified: false, paymentStatus: session.payment_status },
            { status: 400 }
          );
        }
      } catch (stripeError: any) {
        console.error('Stripe API error:', stripeError.message);
        return NextResponse.json(
          { error: 'Unable to verify payment with Stripe', details: stripeError.message },
          { status: 500 }
        );
      }
    }

    // Return Founder Beta data
    return NextResponse.json({
      verified: true,
      paymentStatus: founderBeta.paymentStatus,
      founderLevel: founderBeta.founderLevel,
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
