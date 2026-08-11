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

    // If not found, fetch from Stripe and create record (webhook backup)
    if (!founderBeta) {
      console.log('Record not found, fetching from Stripe:', sessionId);
      
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status !== 'paid') {
          return NextResponse.json(
            { error: 'Payment not completed', verified: false, paymentStatus: session.payment_status },
            { status: 400 }
          );
        }

        // Determine Founder Level
        const amount = session.amount_total || 0;
        let founderLevel = 'Unknown';
        if (amount === 149700) {
          founderLevel = 'Citizen Founder-Beta';
        } else if (amount === 199700) {
          founderLevel = 'Enterprise Founder-Beta';
        }

        // Create the record
        founderBeta = await prisma.founderBeta.create({
          data: {
            fullName: session.customer_details?.name || 'Unknown',
            email: session.customer_details?.email || '',
            phone: session.customer_details?.phone || '',
            address1: session.customer_details?.address?.line1 || '',
            address2: session.customer_details?.address?.line2 || null,
            city: session.customer_details?.address?.city || '',
            state: session.customer_details?.address?.state || '',
            zip: session.customer_details?.address?.postal_code || '',
            country: session.customer_details?.address?.country || 'United States',
            founderLevel,
            stripeCustomerId: session.customer as string || null,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string || null,
            stripePriceId: session.metadata?.price_id || 'payment_link',
            amountPaid: session.amount_total || 0,
            currency: session.currency || 'usd',
            paymentStatus: 'paid',
            intakeCompleted: false,
          },
        });

        console.log('✅ Founder Beta record created via verify API:', founderBeta.id);
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
