import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier } = body; // 'citizen' or 'enterprise'

    if (!tier || !['citizen', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "citizen" or "enterprise".' },
        { status: 400 }
      );
    }

    // Pricing
    const pricing = {
      citizen: {
        amount: 149700, // $1,497
        name: 'Citizen Founder-Beta',
        description: 'Lifetime Founder access. MOSCA onboarding. CAS Team Admin. Wallet activation. No annual fees.',
      },
      enterprise: {
        amount: 199700, // $1,997
        name: 'Enterprise Founder-Beta',
        description: 'Lifetime Founder access. MOSCA onboarding. CAS Main Admin. Enterprise wallet. No annual fees.',
      },
    };

    const selectedTier = pricing[tier as 'citizen' | 'enterprise'];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Network Leveraging Cash Flow | Cash Flow Visionaries - ${selectedTier.name}`,
              description: selectedTier.description,
            },
            unit_amount: selectedTier.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier,
        founderLevel: selectedTier.name,
      },
      success_url: `https://cashflowvisionaries.com/confirmed.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'https://cashflowvisionaries.com/founders-beta.html',
    });

    // Pre-create Founder Beta record with pending status
    const tempEmail = `pending-${Date.now()}-${Math.random().toString(36).substring(7)}@temp.com`;
    const founderBeta = await prisma.founderBeta.create({
      data: {
        fullName: 'Pending',
        email: tempEmail,
        phone: '',
        address1: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        founderLevel: selectedTier.name,
        stripeCheckoutSessionId: session.id,
        stripePriceId: 'checkout_session',
        amountPaid: selectedTier.amount,
        currency: 'usd',
        paymentStatus: 'pending',
        intakeCompleted: false,
      },
    });

    console.log('✅ Checkout session created:', session.id);
    console.log('✅ Pending Founder record created:', founderBeta.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    });

  } catch (error: any) {
    console.error('❌ Checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
