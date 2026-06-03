import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, phone, subdomain, organizationName, referralCode } = body

    if (!email || !firstName || !lastName || !phone || !subdomain || !organizationName || !referralCode) {
      return NextResponse.json(
        { error: 'Email, first name, last name, phone number, subdomain, organization name, and Referral Code are required' },
        { status: 400 }
      )
    }

    const fullName = `${firstName} ${lastName}`

    // Create Stripe Checkout Session for Organization Admin
    // Year 1: $997, Year 2+: $497/year
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1TaIUNDZhlh84GPrkhnpYJXa', // Org Admin: $997
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancelled`,
      customer_email: email,
      metadata: {
        type: 'org_admin_purchase',
        customerName: fullName,
        firstName: firstName,
        lastName: lastName,
        phone: phone || '',
        subdomain: subdomain,
        organizationName: organizationName,
        referralCode: referralCode,
        option: '4',
        setupFee: '997',
        recurringFee: '497',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Org Admin checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
