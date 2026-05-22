import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { stripe, TEAM_ADMIN_PRICE, PLATFORM_FEE_AMOUNT } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Team Admins can create checkout (White-Label owners adding Team Admins to THEIR system)
    if (session.user.role !== 'TEAM_ADMIN' && session.user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { teamAdminData } = body

    if (!teamAdminData) {
      return NextResponse.json({ error: 'Team Admin data required' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      include: { team: true }
    })

    if (!admin || !admin.team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Determine payment recipient for the $297 share
    // YOU (platform) always get $200, this determines who gets the other $297
    const recruiterHasStripe = !!admin.team.stripeAccountId
    
    // Find the system owner (Main Admin of this team's root)
    const systemOwner = await prisma.admin.findFirst({
      where: {
        teamId: admin.teamId,
        role: 'MAIN_ADMIN'
      },
      include: { team: true }
    })

    // Determine who receives the $297
    let recipientStripeAccount: string | null = null

    if (recruiterHasStripe) {
      // Direct recruiter has Stripe → They get $297
      recipientStripeAccount = admin.team.stripeAccountId
    } else if (systemOwner?.team?.stripeAccountId) {
      // Recruiter has NO Stripe → System owner (White-Label owner) gets $297
      recipientStripeAccount = systemOwner.team.stripeAccountId
    }
    // If NEITHER has Stripe → Full $497 stays with YOU (platform owner)

    // Base checkout config - ALL payments go to YOUR platform Stripe account
    const checkoutConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Team Admin - Annual Access',
            },
            unit_amount: TEAM_ADMIN_PRICE, // $497
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?team_admin_added=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
      metadata: {
        teamId: admin.team.id,
        recruiterId: admin.id,
        recruiterRole: admin.role,
        recipientStripeAccount: recipientStripeAccount || 'none',
        teamAdminData: JSON.stringify(teamAdminData),
      },
    }

    // If someone should receive $297: Transfer to their Stripe Connect account
    if (recipientStripeAccount) {
      checkoutConfig.payment_intent_data = {
        application_fee_amount: PLATFORM_FEE_AMOUNT, // YOU keep $200
        transfer_data: {
          destination: recipientStripeAccount, // They get $297
        },
      }
    }
    // If NO recipient: YOU keep full $497 (this only happens in YOUR main system when YOU add directly)

    const checkoutSession = await stripe.checkout.sessions.create(checkoutConfig)

    return NextResponse.json({ 
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    })

  } catch (error) {
    console.error('Create checkout error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', errorMessage, errorStack)
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}
