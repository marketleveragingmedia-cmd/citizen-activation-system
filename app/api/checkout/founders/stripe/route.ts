import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, moscaCode, subdomainOption1, subdomainOption2 } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !moscaCode || !subdomainOption1 || !subdomainOption2) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    // Check subdomain availability (primary first)
    let assignedSubdomain = null
    const subdomain1Check = await prisma.admin.findUnique({
      where: { subdomain: subdomainOption1 }
    })

    if (!subdomain1Check) {
      assignedSubdomain = subdomainOption1
    } else {
      const subdomain2Check = await prisma.admin.findUnique({
        where: { subdomain: subdomainOption2 }
      })
      
      if (!subdomain2Check) {
        assignedSubdomain = subdomainOption2
      } else {
        return NextResponse.json({ error: 'Both subdomain options are already taken. Please choose different options.' }, { status: 400 })
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Founders Beta - Citizen Activation System',
              description: 'Lifetime Access • Zero Annual Fees • Priority Support',
              images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://hub.citizenactivation.com'}/founder-badge.png`],
            },
            unit_amount: 99700, // $997.00
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hub.citizenactivation.com'}/checkout/founders/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hub.citizenactivation.com'}/checkout/cancelled`,
      customer_email: email,
      metadata: {
        type: 'founder_purchase',
        firstName,
        lastName,
        email,
        phone,
        moscaCode,
        assignedSubdomain,
        subdomainOption1,
        subdomainOption2,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Founder Stripe checkout error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 })
  }
}
