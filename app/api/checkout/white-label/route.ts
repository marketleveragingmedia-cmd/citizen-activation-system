import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, tier } = body
    
    const fullName = `${firstName} ${lastName}`

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, last name and tier are required' },
        { status: 400 }
      )
    }

    // Determine price based on tier (promo or regular)
    const isPromo = tier === 'promo'
    const amount = isPromo ? 199700 : 299700 // $1,997 or $2,997

    // Create Stripe Checkout Session for White-Label
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1TaIUODZhlh84GPrhYqUu2Mq', // White Label: $1,997
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancelled`,
      customer_email: email,
      metadata: {
        type: 'white_label_purchase',
        customerName: fullName,
        firstName: firstName,
        lastName: lastName,
        option: '3',
        tier: tier || 'regular',
        setupFee: isPromo ? '1997' : '2997',
        recurringFee: '997',
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
