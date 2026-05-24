import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create Stripe Connect accounts
    if (session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      include: { team: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 })
    }

    if (!admin.teamId || !admin.team) {
      return NextResponse.json({ 
        error: 'No team associated with this admin account',
        debug: { adminId: admin.id, teamId: admin.teamId }
      }, { status: 404 })
    }

    // Check if team already has a Stripe account
    if (admin.team.stripeAccountId) {
      return NextResponse.json({ 
        error: 'Stripe account already connected',
        accountId: admin.team.stripeAccountId 
      }, { status: 400 })
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: admin.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        teamId: admin.team.id,
        teamName: admin.team.name,
        adminId: admin.id
      }
    })

    // Save Stripe account ID to team
    await prisma.team.update({
      where: { id: admin.team.id },
      data: { stripeAccountId: account.id }
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/stripe/refresh`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/stripe/success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ 
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url
    })

  } catch (error: any) {
    console.error('Create Stripe Connect account error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
