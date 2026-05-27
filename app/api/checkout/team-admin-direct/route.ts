import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, phone } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      )
    }

    const fullName = `${firstName} ${lastName}`

    // Create Stripe Checkout Session for Team Admin Direct
    // Year 1: $497, Year 2+: $497/year
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'TEAM_ADMIN_DIRECT_YEAR1_PRICE_ID', // Replace with actual Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancelled`,
      customer_email: email,
      metadata: {
        type: 'team_admin_direct_purchase',
        customerName: fullName,
        firstName: firstName,
        lastName: lastName,
        phone: phone || '',
        option: '2',
        setupFee: '497',
        recurringFee: '497',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Team Admin Direct checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
