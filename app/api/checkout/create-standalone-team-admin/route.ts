import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia'
});

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    // Create Stripe Checkout Session with subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Standalone Team Admin',
              description: 'Independent Citizen Activation System - Team Admin Access'
            },
            unit_amount: 49700, // $497.00
            recurring: {
              interval: 'year'
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        productType: 'standalone_team_admin',
        firstName,
        lastName,
        email
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancelled`
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
