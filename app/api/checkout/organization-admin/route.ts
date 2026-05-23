import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName } = body
    
    const fullName = `${firstName} ${lastName}`

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name and last name are required' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session for Option 2: Organization Admin
    // Year 1: $997, Year 2+: $497/year
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1TaIUNDZhlh84GPrkhnpYJXa', // Organization Admin: $997 Year 1
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancelled`,
      customer_email: email,
      metadata: {
        type: 'organization_admin_purchase',
        customerName: fullName,
        firstName: firstName,
        lastName: lastName,
        option: '2',
        setupFee: '997',
        recurringFee: '497',
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
