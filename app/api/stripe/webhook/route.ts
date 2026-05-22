import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/email'
import Stripe from 'stripe'

// Disable body parser for webhooks
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not set')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Check payment type
      const paymentType = session.metadata?.type

      if (paymentType === 'team_admin_payment' && session.metadata?.teamAdminData) {
        // NEW FLOW: Team Admin paid for their own access
        try {
          const teamAdminData = JSON.parse(session.metadata.teamAdminData)
          const recruiterId = session.metadata.recruiterId
          const recruiterTeamId = session.metadata.recruiterTeamId
          const recruiterWantsCommission = session.metadata.recruiterWantsCommission === 'true'

          // Generate temp password
          const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Create Team Admin
          const newAdmin = await prisma.admin.create({
            data: {
              teamId: recruiterTeamId,
              firstName: teamAdminData.adminFirstName,
              lastName: teamAdminData.adminLastName,
              email: teamAdminData.adminEmail,
              phone: teamAdminData.adminPhone || null,
              passwordHash: hashedPassword,
              role: 'TEAM_ADMIN',
              status: 'Active'
            }
          })

          // Create team for this Team Admin
          if (teamAdminData.teamName) {
            await prisma.team.create({
              data: {
                name: teamAdminData.teamName,
                adminId: newAdmin.id,
                tierType: teamAdminData.tierType === 'solo-org' ? 'SoloOrg' : 'FullSystem',
                customDomain: teamAdminData.customDomain || null,
                logoUrl: teamAdminData.logoUrl || null,
                status: 'Active'
              }
            })
          }

          // Send welcome email to NEW Team Admin
          const adminFullName = `${teamAdminData.adminFirstName} ${teamAdminData.adminLastName}`
          await sendEmail({
            to: teamAdminData.adminEmail,
            subject: 'Welcome to Citizen Activation System - Account Activated',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1E8E5A;">🎉 Payment Confirmed - Account Activated!</h2>
                
                <p>Hello ${adminFullName},</p>
                
                <p>Your payment has been received and your Team Admin account is now active!</p>

                <h3>Login Credentials:</h3>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
                  <p><strong>Email:</strong> ${teamAdminData.adminEmail}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>

                <p><strong>Please change your password after your first login.</strong></p>

                <p style="margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/login" 
                     style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Login Now
                  </a>
                </p>

                <p>You can now add Strategic Partners and manage MOSCA invitation requests.</p>

                <hr>
                <p style="font-size: 12px; color: #666;">
                  Strategic Partner Hub<br>
                  citizenactivation.com
                </p>
              </div>
            `
          })

          // Send confirmation to recruiter
          const recruiter = await prisma.admin.findUnique({
            where: { id: recruiterId },
            include: { team: true }
          })

          if (recruiter) {
            const recruiterFullName = `${recruiter.firstName} ${recruiter.lastName}`
            const hasStripe = !!recruiter.team?.stripeAccountId
            const earnedCommission = recruiterWantsCommission && hasStripe

            await sendEmail({
              to: recruiter.email,
              subject: '✅ Team Admin Activated - Payment Received',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1E8E5A;">✅ Team Admin Successfully Added!</h2>
                  
                  <p>Hello ${recruiterFullName},</p>
                  
                  <p><strong>${adminFullName}</strong> has completed payment and their Team Admin account is now active.</p>

                  <h3>Account Details:</h3>
                  <ul>
                    <li><strong>Name:</strong> ${adminFullName}</li>
                    <li><strong>Email:</strong> ${teamAdminData.adminEmail}</li>
                    <li><strong>Team:</strong> ${teamAdminData.teamName}</li>
                    <li><strong>Payment:</strong> $497 received</li>
                  </ul>

                  ${earnedCommission ? `
                    <div style="background: #D1FAE5; border: 2px solid #1E8E5A; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h4 style="color: #065F46; margin-top: 0;">💰 Commission Earned!</h4>
                      <p style="color: #065F46; margin-bottom: 0;">
                        <strong>$297</strong> has been transferred to your Stripe account.
                      </p>
                    </div>
                  ` : !recruiterWantsCommission ? `
                    <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h4 style="color: #92400E; margin-top: 0;">Commission Forfeited</h4>
                      <p style="color: #92400E; margin-bottom: 0;">
                        You chose to forfeit commission. The $297 was allocated to the system owner.
                      </p>
                    </div>
                  ` : `
                    <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h4 style="color: #92400E; margin-top: 0;">⚠️ Commission Not Received</h4>
                      <p style="color: #92400E; margin-bottom: 10px;">
                        You selected to earn commission but didn't have Stripe connected at the time of payment.
                      </p>
                      <p style="color: #92400E; margin-bottom: 0;">
                        The $297 was allocated to the system owner. <a href="${process.env.NEXTAUTH_URL}/dashboard" style="color: #1E8E5A; font-weight: bold;">Connect Stripe now</a> to earn commission on future Team Admin additions.
                      </p>
                    </div>
                  `}

                  <p style="margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                       style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      View Dashboard
                    </a>
                  </p>

                  <hr>
                  <p style="font-size: 12px; color: #666;">
                    Strategic Partner Hub<br>
                    citizenactivation.com
                  </p>
                </div>
              `
            })
          }

          console.log('Team Admin created successfully via NEW flow:', newAdmin.email)
        } catch (err) {
          console.error('Error creating Team Admin after payment (NEW flow):', err)
        }
      } else if (session.metadata?.teamAdminData) {
        // OLD FLOW: For backwards compatibility (recruiter paid)
        try {
          const teamAdminData = JSON.parse(session.metadata.teamAdminData)
          const teamId = session.metadata.teamId
          const recruiterId = session.metadata.recruiterId
          const recruiterRole = session.metadata.recruiterRole

          // Generate temp password
          const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Create Team Admin
          const newAdmin = await prisma.admin.create({
            data: {
              teamId: teamId,
              firstName: teamAdminData.adminFirstName,
              lastName: teamAdminData.adminLastName,
              email: teamAdminData.adminEmail,
              passwordHash: hashedPassword,
              role: 'TEAM_ADMIN',
              status: 'Active'
            }
          })

          // Create team for this Team Admin (if they're creating their own sub-team)
          if (teamAdminData.teamName) {
            await prisma.team.create({
              data: {
                name: teamAdminData.teamName,
                adminId: newAdmin.id,
                tierType: teamAdminData.tierType === 'solo-org' ? 'SoloOrg' : 'FullSystem',
                customDomain: teamAdminData.customDomain || null,
                logoUrl: teamAdminData.logoUrl || null,
                status: 'Active'
              }
            })
          }

          // Send welcome email
          const adminFullName = `${teamAdminData.adminFirstName} ${teamAdminData.adminLastName}`
          await sendEmail({
            to: teamAdminData.adminEmail,
            subject: 'Welcome to Citizen Activation System',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1E8E5A;">Welcome to Citizen Activation System!</h2>
                
                <p>Hello ${adminFullName},</p>
                
                <p>Your Team Admin account has been created and activated.</p>

                <h3>Login Credentials:</h3>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
                  <p><strong>Email:</strong> ${teamAdminData.adminEmail}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>

                <p><strong>Please change your password after your first login.</strong></p>

                <p style="margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/login" 
                     style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Login Now
                  </a>
                </p>

                <p>You can now add Strategic Partners and manage MOSCA invitation requests.</p>

                <hr>
                <p style="font-size: 12px; color: #666;">
                  Strategic Partner Hub<br>
                  citizenactivation.com
                </p>
              </div>
            `
          })

          console.log('Team Admin created successfully:', newAdmin.email)
        } catch (err) {
          console.error('Error creating Team Admin after payment:', err)
        }
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
