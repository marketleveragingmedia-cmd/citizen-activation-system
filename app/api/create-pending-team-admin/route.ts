import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Master Admin, Main Admin, Team Admin, or Org Admin can use this endpoint
    const allowedRoles = ['MASTER_ADMIN', 'MAIN_ADMIN', 'TEAM_ADMIN', 'ORG_ADMIN']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      teamName,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPhone,
      subdomain,
      moscaReferralCode,
      tierType,
      customDomain,
      logoUrl,
      wantsCommission
    } = body

    // Validate required fields
    if (!teamName || !adminFirstName || !adminLastName || !adminEmail || !subdomain || !moscaReferralCode) {
      return NextResponse.json({ error: 'Missing required fields (including subdomain and MOSCA Referral Code)' }, { status: 400 })
    }

    // Get recruiter info
    const recruiter = await prisma.admin.findUnique({
      where: { id: session.user.id },
      include: { team: true }
    })

    if (!recruiter || !recruiter.team) {
      return NextResponse.json({ error: 'Recruiter team not found' }, { status: 404 })
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Create Stripe checkout session for the NEW Team Admin to pay
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Team Admin - Annual Access',
            },
            unit_amount: 49700, // $497
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: adminEmail, // NEW Team Admin's email
      success_url: `${process.env.NEXTAUTH_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment-cancelled`,
      metadata: {
        type: 'team_admin_payment',
        recruiterId: recruiter.id,
        recruiterTeamId: recruiter.teamId,
        recruiterWantsCommission: wantsCommission ? 'true' : 'false',
        teamAdminData: JSON.stringify({
          teamName,
          adminFirstName,
          adminLastName,
          adminEmail,
          adminPhone,
          subdomain,
          moscaReferralCode,
          tierType,
          customDomain,
          logoUrl
        }),
      },
    })

    // Send payment link email to NEW Team Admin
    const recruiterFullName = `${recruiter.firstName} ${recruiter.lastName}`
    await sendEmail({
      to: adminEmail,
      subject: 'Complete Your Team Admin Payment - Citizen Activation System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E8E5A;">Complete Your Team Admin Setup</h2>
          
          <p>Hello ${adminFirstName},</p>
          
          <p>${recruiterFullName} has invited you to join as a Team Admin in the Citizen Activation System.</p>

          <h3>Your Team Admin Access Includes:</h3>
          <ul>
            <li>✓ Oversee your team</li>
            <li>✓ Add Strategic Partners</li>
            <li>✓ Receive invitation requests via Round Robin</li>
            <li>✓ Full dashboard access</li>
          </ul>

          <h3>Investment: $497/year</h3>

          <p style="margin: 30px 0;">
            <a href="${checkoutSession.url}" 
               style="background: #1E8E5A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Complete Payment ($497)
            </a>
          </p>

          <p style="font-size: 14px; color: #666;">
            Once payment is complete, your Team Admin account will be activated immediately and login credentials will be sent to this email.
          </p>

          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Strategic Partner Hub<br>
            citizenactivation.com
          </p>
        </div>
      `
    })

    // Send confirmation to recruiter
    await sendEmail({
      to: recruiter.email,
      subject: 'Payment Link Sent - Team Admin Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E8E5A;">Payment Link Sent Successfully</h2>
          
          <p>Hello ${recruiterFullName},</p>
          
          <p>A payment link has been sent to <strong>${adminEmail}</strong> (${adminFirstName} ${adminLastName}).</p>

          <h3>What Happens Next:</h3>
          <ol>
            <li>${adminFirstName} receives email with payment link</li>
            <li>${adminFirstName} completes payment ($497)</li>
            <li>Team Admin account created automatically</li>
            <li>${wantsCommission ? 'You receive $297 commission (transferred to your Stripe account)' : 'Commission forfeited - goes to system owner'}</li>
            <li>${adminFirstName} receives login credentials</li>
          </ol>

          ${wantsCommission && !recruiter.team.stripeAccountId ? `
            <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #92400E; margin-top: 0;">⚠️ Action Required: Connect Stripe</h4>
              <p style="color: #92400E; margin-bottom: 10px;">
                You selected to earn commission but haven't connected Stripe yet.
              </p>
              <p style="color: #92400E; margin-bottom: 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" style="color: #1E8E5A; font-weight: bold;">
                  Connect Stripe Now
                </a> to receive your $297 commission when payment is completed.
              </p>
            </div>
          ` : ''}

          <p style="margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </p>

          <hr style="margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Strategic Partner Hub<br>
            citizenactivation.com
          </p>
        </div>
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Payment link sent to new Team Admin',
      checkoutUrl: checkoutSession.url
    })

  } catch (error) {
    console.error('Create pending Team Admin error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to create pending Team Admin',
      details: errorMessage
    }, { status: 500 })
  }
}
