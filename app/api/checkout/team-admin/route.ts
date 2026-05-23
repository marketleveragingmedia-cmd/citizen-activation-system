import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name and last name are required' },
        { status: 400 }
      )
    }

    const fullName = `${firstName} ${lastName}`

    // Create Stripe Checkout Session for Team Admin Access
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1TaIUNDZhlh84GPr3jQXmUtW', // Team Admin: $497/year
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancelled`,
      customer_email: email,
      metadata: {
        type: 'team_admin_purchase',
        customerName: fullName,
        firstName: firstName,
        lastName: lastName,
        option: '1',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
