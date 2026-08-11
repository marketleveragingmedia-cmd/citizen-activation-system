import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const prisma = new PrismaClient();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log('✅ Checkout session completed:', session.id);

      // Determine Founder Level based on amount (Stripe payment links don't include line_items)
      let founderLevel = 'Unknown';
      const amount = session.amount_total || 0;
      
      if (amount === 149700) {
        founderLevel = 'Citizen Founder-Beta';
      } else if (amount === 199700) {
        founderLevel = 'Enterprise Founder-Beta';
      } else {
        console.warn('⚠️ Unknown amount:', amount);
        founderLevel = amount === 149700 ? 'Citizen Founder-Beta' : 'Enterprise Founder-Beta';
      }
      
      console.log('💰 Amount:', amount, '| Level:', founderLevel);

      // Create Founder Beta record
      const founderBeta = await prisma.founderBeta.create({
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

      console.log('✅ Founder Beta record created:', founderBeta.id);

      return NextResponse.json({
        success: true,
        founderBetaId: founderBeta.id,
      });
    }

    // Return 200 for other event types
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
