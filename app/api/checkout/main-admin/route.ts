import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, phone, subdomain, moscaReferralCode } = body

    if (!email || !firstName || !lastName || !phone || !subdomain || !moscaReferralCode) {
      return NextResponse.json(
        { error: 'Email, first name, last name, phone number, subdomain, and MOSCA Referral Code are required' },
        { status: 400 }
      )
    }

    const fullName = `${firstName} ${lastName}`

    // Create Stripe Checkout Session for Main Admin
    // Year 1: $1,497, Year 2+: $997/year
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Main Admin Access - Year 1',
              description: 'Full network control, add Team Admins & Org Admins, see entire network',
            },
            unit_amount: 149700, // $1,497
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancelled`,
      customer_email: email,
      metadata: {
        type: 'main_admin_purchase',
        customerName: fullName,
        firstName: firstName,
        lastName: lastName,
        phone: phone || '',
        subdomain: subdomain,
        moscaReferralCode: moscaReferralCode,
        option: '1',
        setupFee: '1497',
        recurringFee: '997',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Main Admin checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
