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
          // Support both old and new field names for backward compatibility
          const parentAdminId = session.metadata.parentAdminId || session.metadata.recruiterId
          const parentTeamId = session.metadata.parentTeamId || session.metadata.recruiterTeamId
          const receivesPaymentSplit = 
            session.metadata.receivesPaymentSplit === 'true' || 
            session.metadata.recruiterWantsCommission === 'true'

          // Generate temp password
          const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Create Team Admin
          const newAdmin = await prisma.admin.create({
            data: {
              teamId: parentTeamId,
              firstName: teamAdminData.adminFirstName,
              lastName: teamAdminData.adminLastName,
              email: teamAdminData.adminEmail,
              phone: teamAdminData.adminPhone || null,
              subdomain: teamAdminData.subdomain || null,
              passwordHash: hashedPassword,
              referralCode: teamAdminData.referralCode || null,
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

                <p>You can now add Strategic Partners and manage Private Invitation requests.</p>

                <hr>
                <p style="font-size: 12px; color: #666;">
                  Strategic Partner Hub<br>
                  citizenactivation.com
                </p>
              </div>
            `
          })

          // Send confirmation to parent admin who added this account
          const parentAdmin = await prisma.admin.findUnique({
            where: { id: parentAdminId },
            include: { team: true }
          })

          if (parentAdmin) {
            const parentAdminFullName = `${parentAdmin.firstName} ${parentAdmin.lastName}`
            const hasStripeConnected = !!parentAdmin.team?.stripeAccountId
            const earnedPaymentSplit = receivesPaymentSplit && hasStripeConnected

            // Process commission transfer if earned
            if (earnedPaymentSplit) {
              try {
                await stripe.transfers.create({
                  amount: 20000, // $200 in cents
                  currency: 'usd',
                  destination: parentAdmin.team.stripeAccountId!,
                  description: `Payment split for Team Admin: ${adminFullName}`,
                  metadata: {
                    type: 'team_admin_payment_split',
                    parentAdminId: parentAdmin.id,
                    parentAdminName: parentAdminFullName,
                    teamAdminId: newAdmin.id,
                    teamAdminName: adminFullName,
                    teamAdminEmail: teamAdminData.adminEmail,
                  }
                });
                console.log(`✅ Payment split transfer successful: $200 to ${parentAdminFullName}`);
              } catch (transferError) {
                console.error('❌ Payment split transfer failed:', transferError);
                // Continue execution - send email with note about transfer failure
              }
            }

            await sendEmail({
              to: parentAdmin.email,
              subject: '✅ Team Admin Activated - Payment Received',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1E8E5A;">✅ Team Admin Successfully Added!</h2>
                  
                  <p>Hello ${parentAdminFullName},</p>
                  
                  <p><strong>${adminFullName}</strong> has completed payment and their Team Admin account is now active.</p>

                  <h3>Account Details:</h3>
                  <ul>
                    <li><strong>Name:</strong> ${adminFullName}</li>
                    <li><strong>Email:</strong> ${teamAdminData.adminEmail}</li>
                    <li><strong>Team:</strong> ${teamAdminData.teamName}</li>
                    <li><strong>Payment:</strong> $497 received</li>
                  </ul>

                  ${earnedPaymentSplit ? `
                    <div style="background: #D1FAE5; border: 2px solid #1E8E5A; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h4 style="color: #065F46; margin-top: 0;">💰 Payment Received!</h4>
                      <p style="color: #065F46; margin-bottom: 0;">
                        <strong>$200</strong> has been transferred to your Stripe account.
                      </p>
                    </div>
                  ` : !receivesPaymentSplit ? `
                    <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h4 style="color: #92400E; margin-top: 0;">Payment Forfeited</h4>
                      <p style="color: #92400E; margin-bottom: 0;">
                        You chose to forfeit payment. The $297 was allocated to the system owner.
                      </p>
                    </div>
                  ` : `
                    <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h4 style="color: #92400E; margin-top: 0;">⚠️ Payment Not Received</h4>
                      <p style="color: #92400E; margin-bottom: 10px;">
                        You selected to receive payment but didn't have Stripe connected at the time of payment.
                      </p>
                      <p style="color: #92400E; margin-bottom: 0;">
                        The $297 was allocated to the system owner. <a href="${process.env.NEXTAUTH_URL}/dashboard" style="color: #1E8E5A; font-weight: bold;">Connect Stripe now</a> to receive payment when you add Team Admins.
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

                <p>You can now add Strategic Partners and manage Private Invitation requests.</p>

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

      // MAIN ADMIN PURCHASE (Option 1)
      if (paymentType === 'main_admin_purchase') {
        try {
          const { firstName, lastName, email, phone, subdomain, referralCode } = session.metadata
          
          // Generate temp password
          const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Create Main Admin Team
          const team = await prisma.team.create({
            data: {
              name: `${firstName} ${lastName}'s Network`,
              adminId: '', // Will be updated after admin creation
              tierType: 'FullSystem',
              status: 'Active'
            }
          })

          // Create Main Admin
          const mainAdmin = await prisma.admin.create({
            data: {
              firstName,
              lastName,
              email,
              phone: phone || null,
              subdomain: subdomain || null,
              passwordHash: hashedPassword,
              referralCode: referralCode || null,
              role: 'MAIN_ADMIN',
              status: 'Active',
              teamId: team.id
            }
          })

          // Update team adminId
          await prisma.team.update({
            where: { id: team.id },
            data: { adminId: mainAdmin.id }
          })

          // Send welcome email
          await sendEmail({
            to: email,
            subject: 'Welcome to Citizen Activation System - Main Admin Account',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1E8E5A;">🎉 Main Admin Account Activated!</h2>
                
                <p>Hello ${firstName} ${lastName},</p>
                
                <p>Your Main Admin account is now active! You have full network control.</p>

                <h3>Login Credentials:</h3>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>

                <p><strong>Please change your password after your first login.</strong></p>

                <h3>What You Can Do:</h3>
                <ul>
                  <li>Add Team Admins & Organization Admins</li>
                  <li>See your entire network including all requests & Strategic Partners</li>
                  <li>Receive payments when you add Team Admins</li>
                </ul>

                <p style="margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/login" 
                     style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Login Now
                  </a>
                </p>

                <hr>
                <p style="font-size: 12px; color: #666;">
                  Strategic Partner Hub<br>
                  citizenactivation.com<br>
                  Annual Renewal: $997/year
                </p>
              </div>
            `
          })

          console.log('Main Admin created successfully:', mainAdmin.email)
        } catch (err) {
          console.error('Error creating Main Admin after payment:', err)
        }
      }

      // TEAM ADMIN DIRECT PURCHASE (Option 2)
      if (paymentType === 'team_admin_direct_purchase') {
        try {
          const { firstName, lastName, email, phone, subdomain, referralCode } = session.metadata
          
          // Generate temp password
          const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Find Master Admin's team (or create default team)
          let masterTeam = await prisma.team.findFirst({
            where: {
              admins: {
                some: { role: 'MASTER_ADMIN' }
              }
            }
          })

          if (!masterTeam) {
            // Create default team if none exists
            masterTeam = await prisma.team.create({
              data: {
                name: 'Main Team',
                adminId: '',
                tierType: 'FullSystem',
                status: 'Active'
              }
            })
          }

          // Create Team Admin
          const teamAdmin = await prisma.admin.create({
            data: {
              firstName,
              lastName,
              email,
              phone: phone || null,
              subdomain: subdomain || null,
              passwordHash: hashedPassword,
              referralCode: referralCode || null,
              role: 'TEAM_ADMIN',
              status: 'Active',
              teamId: masterTeam.id
            }
          })

          // Send welcome email
          await sendEmail({
            to: email,
            subject: 'Welcome to Citizen Activation System - Team Admin Account',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1E8E5A;">🎉 Team Admin Account Activated!</h2>
                
                <p>Hello ${firstName} ${lastName},</p>
                
                <p>Your Team Admin account is now active!</p>

                <h3>Login Credentials:</h3>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>

                <p><strong>Please change your password after your first login.</strong></p>

                <h3>What You Can Do:</h3>
                <ul>
                  <li>Manage Strategic Partners</li>
                  <li>Oversee invitation requests</li>
                  <li>Add Team Admins & Organization Admins (earn commission)</li>
                </ul>

                <p style="margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/login" 
                     style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Login Now
                  </a>
                </p>

                <hr>
                <p style="font-size: 12px; color: #666;">
                  Strategic Partner Hub<br>
                  citizenactivation.com<br>
                  Annual Renewal: $497/year
                </p>
              </div>
            `
          })

          console.log('Team Admin (Direct) created successfully:', teamAdmin.email)
        } catch (err) {
          console.error('Error creating Team Admin (Direct) after payment:', err)
        }
      }

      // ORG ADMIN PURCHASE (Option 4)
      if (paymentType === 'org_admin_purchase') {
        try {
          const { firstName, lastName, email, phone, subdomain, organizationName, referralCode } = session.metadata
          // Support both old and new field names for backward compatibility
          const parentAdminId = session.metadata.parentAdminId || session.metadata.recruiterId
          const receivesPaymentSplit = 
            session.metadata.receivesPaymentSplit === 'true' || 
            session.metadata.recruiterWantsCommission === 'true'
          
          // Generate temp password
          const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Create Organization Team
          const orgTeam = await prisma.team.create({
            data: {
              name: organizationName,
              adminId: '', // Will be updated
              tierType: 'SoloOrg',
              status: 'Active'
            }
          })

          // Create Org Admin
          const orgAdmin = await prisma.admin.create({
            data: {
              firstName,
              lastName,
              email,
              phone: phone || null,
              subdomain: subdomain || null,
              passwordHash: hashedPassword,
              referralCode: referralCode || null,
              role: 'ORG_ADMIN',
              status: 'Active',
              teamId: orgTeam.id
            }
          })

          // Update team adminId
          await prisma.team.update({
            where: { id: orgTeam.id },
            data: { adminId: orgAdmin.id }
          })

          // Handle payment split if parent admin wants it and has Stripe Connect
          if (parentAdminId && receivesPaymentSplit) {
            const parentAdmin = await prisma.admin.findUnique({
              where: { id: parentAdminId },
              include: { team: true }
            })

            if (parentAdmin?.team?.stripeAccountId) {
              // Year 1: Transfer $297 to parent admin (Platform keeps $700)
              const isFirstYear = true // Determine from subscription metadata if needed
              const paymentSplitAmount = isFirstYear ? 29700 : 20000 // $297 Y1, $200 Y2+

              try {
                await stripe.transfers.create({
                  amount: paymentSplitAmount,
                  currency: 'usd',
                  destination: parentAdmin.team.stripeAccountId,
                  description: `Payment split for Org Admin: ${firstName} ${lastName}`,
                  metadata: {
                    type: 'org_admin_payment_split',
                    orgAdminEmail: email,
                    parentAdminEmail: parentAdmin.email,
                    organizationName
                  }
                })

                const parentAdminFullName = `${parentAdmin.firstName} ${parentAdmin.lastName}`
                const amountDisplay = isFirstYear ? '$297' : '$200'
                console.log(`✅ Org Admin payment split transfer successful: ${amountDisplay} to ${parentAdminFullName}`)

                // Notify parent admin
                await sendEmail({
                  to: parentAdmin.email,
                  subject: `💰 Payment Received - Organization Admin Added`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #1E8E5A;">💰 Payment Received!</h2>
                      <p>Hello ${parentAdminFullName},</p>
                      <p>Great news! A new Organization Admin has been added to your network:</p>
                      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Organization:</strong> ${organizationName}</p>
                        <p><strong>Admin:</strong> ${firstName} ${lastName}</p>
                        <p><strong>Your Payment:</strong> <strong>${amountDisplay}</strong></p>
                      </div>
                      <p><strong>${amountDisplay}</strong> has been transferred to your Stripe account.</p>
                      <p>Keep growing your network to receive more payments!</p>
                    </div>
                  `
                })
              } catch (transferError) {
                console.error('Org Admin payment split transfer failed:', transferError)
              }
            }
          }

          // Send welcome email
          await sendEmail({
            to: email,
            subject: 'Welcome to Citizen Activation System - Organization Admin Account',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1E8E5A;">🎉 Organization Admin Account Activated!</h2>
                
                <p>Hello ${firstName} ${lastName},</p>
                
                <p>Your Organization Admin account for <strong>${organizationName}</strong> is now active!</p>

                <h3>Login Credentials:</h3>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>

                <p><strong>Please change your password after your first login.</strong></p>

                <h3>What You Can Do:</h3>
                <ul>
                  <li>Organization branding & customization</li>
                  <li>See only YOUR network/members</li>
                  <li>Bulk onboarding tools for large groups</li>
                  <li>Add Team Admins (earn commission)</li>
                </ul>

                <p style="margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/login" 
                     style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Login Now
                  </a>
                </p>

                <hr>
                <p style="font-size: 12px; color: #666;">
                  Strategic Partner Hub<br>
                  citizenactivation.com<br>
                  Annual Renewal: $497/year
                </p>
              </div>
            `
          })

          console.log('Org Admin created successfully:', orgAdmin.email)
        } catch (err) {
          console.error('Error creating Org Admin after payment:', err)
        }
      }

      // FOUNDER PURCHASE
      if (paymentType === 'founder_purchase') {
        try {
          const { firstName, lastName, email, phone, moscaCode, assignedSubdomain } = session.metadata || {}

          if (!email || !firstName || !lastName) {
            console.error('Missing required Founder metadata')
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
          }

          // Generate temp password
          const tempPassword = Math.random().toString(36).slice(-10) + 'F1!'
          const hashedPassword = await bcrypt.hash(tempPassword, 10)

          // Create Main Admin account with Founder status
          const founder = await prisma.admin.create({
            data: {
              firstName,
              lastName,
              email,
              phone: phone || null,
              subdomain: assignedSubdomain || null,
              moscaCode: moscaCode || null,
              passwordHash: hashedPassword,
              role: 'MAIN_ADMIN',
              status: 'Active',
              isFounder: true,
              founderDate: new Date(),
              founderPaymentMethod: 'Stripe',
              founderPaymentDetails: `Stripe Session: ${session.id}`,
            }
          })

          // Create team for Founder
          await prisma.team.create({
            data: {
              name: `${firstName} ${lastName} - Founder Network`,
              adminId: founder.id,
              tierType: 'FullSystem',
              status: 'Active',
              createdByAdminId: founder.id,
            }
          })

          // Send welcome email
          await sendEmail({
            to: email,
            subject: '🎉 Welcome, Founder! Your Lifetime Account is Ready',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #1E8E5A; font-size: 32px; margin-bottom: 10px;">⭐ Welcome, Founder!</h1>
                  <p style="font-size: 18px; color: #666;">Your Lifetime Account is Active</p>
                </div>
                
                <div style="background: #f0fdf4; border: 2px solid #1E8E5A; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                  <h3 style="color: #1E8E5A; margin-top: 0;">Login Credentials:</h3>
                  <p><strong>URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${tempPassword}</code></p>
                  <p style="color: #dc2626; font-weight: bold;">⚠️ Please change your password after first login</p>
                </div>

                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; color: #92400e;">🔗 Your Custom Link:</h3>
                  <p style="font-size: 18px; font-weight: bold; color: #92400e;">${assignedSubdomain}.citizenactivation.com</p>
                  <p style="font-size: 14px; color: #92400e; margin-bottom: 0;">Share during MOSCA presentations only</p>
                </div>

                <h3>Founder Benefits:</h3>
                <ul style="line-height: 1.8;">
                  <li>✅ <strong>Lifetime Access</strong> - Zero annual fees, ever</li>
                  <li>⭐ <strong>Founder Badge</strong> - Recognition in your dashboard</li>
                  <li>🎯 <strong>Priority Support</strong> - Direct assistance when needed</li>
                  <li>💰 <strong>Payment Splits</strong> - Earn $200-$297 per admin you add</li>
                  <li>🚀 <strong>Early Access</strong> - New features before general release</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXTAUTH_URL}/login" 
                     style="background: #1E8E5A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">
                    Go to Dashboard
                  </a>
                </div>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="font-size: 12px; color: #666; text-align: center;">
                  Questions? Email <a href="mailto:support@citizenactivation.com">support@citizenactivation.com</a><br>
                  Citizen Activation System - Founders Beta<br>
                  Lifetime Access • Zero Annual Fees
                </p>
              </div>
            `
          })

          // Notify admin
          await sendEmail({
            to: 'mzsamantha01@gmail.com',
            subject: '🎉 New Stripe Founder Account Created',
            html: `
              <h2>New Stripe Founder</h2>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subdomain:</strong> ${assignedSubdomain}.citizenactivation.com</p>
              <p><strong>MOSCA Code:</strong> ${moscaCode}</p>
              <p><strong>Payment:</strong> $997 via Stripe</p>
              <p><strong>Status:</strong> ✅ Account Created & Active</p>
            `
          })

          console.log('Founder created successfully:', founder.email)
        } catch (err) {
          console.error('Error creating Founder after payment:', err)
        }
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
