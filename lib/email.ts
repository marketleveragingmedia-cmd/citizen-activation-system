import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string // Optional custom from name
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'Strategic Partner Hub <notifications@m.citizenactivation.com>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    console.log('Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}

// Generate branded email header
function getBrandedEmailHeader(logoUrl?: string | null, organizationName?: string | null) {
  if (!logoUrl && !organizationName) {
    return '' // Use platform branding
  }

  return `
    <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f9fafb; border-bottom: 3px solid #1E8E5A;">
      ${logoUrl ? `<img src="${logoUrl}" alt="${organizationName || 'Organization'}" style="max-height: 60px; margin-bottom: 10px;" />` : ''}
      ${organizationName ? `<h1 style="margin: 0; color: #1f2937; font-size: 24px;">${organizationName}</h1>` : ''}
    </div>
  `
}

// Generate branded email footer
function getBrandedEmailFooter(organizationName?: string | null, hidePlatformBranding?: boolean) {
  if (hidePlatformBranding) {
    return `
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        ${organizationName || 'Strategic Partner Hub'}
      </p>
    `
  }

  return `
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #6b7280; text-align: center;">
      ${organizationName ? `${organizationName}<br>` : ''}
      Powered by Strategic Partner Hub<br>
      citizenactivation.com
    </p>
  `
}

// Email Templates

export function getRequesterConfirmationEmail(
  name: string, 
  level: string,
  branding?: {
    logoUrl?: string | null
    organizationName?: string | null
    primaryColor?: string | null
    hidePlatformBranding?: boolean
  }
) {
  const header = getBrandedEmailHeader(branding?.logoUrl, branding?.organizationName)
  const footer = getBrandedEmailFooter(branding?.organizationName, branding?.hidePlatformBranding)
  const buttonColor = branding?.primaryColor || '#1E8E5A'

  return {
    subject: `MOSCA Invitation Request Received - ${level} Activation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${header}
        <h2 style="color: #1f2937;">Thank you, ${name}!</h2>
        <p>Your MOSCA invitation request has been received and assigned to a Strategic Partner.</p>
        <p><strong>Requested Activation Level:</strong> ${level}</p>
        <p>Your assigned Strategic Partner will contact you within 24-48 hours with your official MOSCA invitation and onboarding details.</p>
        <p>What happens next:</p>
        <ol>
          <li>Strategic Partner sends official MOSCA invitation</li>
          <li>Schedule Wallet Activation Session with MOSCA Certified Specialist</li>
          <li>Complete Onboarding and Activate Your Wallet</li>
          <li>Join the MOSCA Community as an Activated ${level} Member</li>
        </ol>
        <p>Welcome to the Movement!</p>
        ${footer}
      </div>
    `
  }
}

export function getStrategicPartnerAssignmentEmail(
  partnerName: string,
  requesterName: string,
  requesterEmail: string,
  requesterPhone: string | null,
  level: string,
  referralCode: string | null,
  dashboardUrl: string,
  branding?: {
    logoUrl?: string | null
    organizationName?: string | null
    primaryColor?: string | null
    hidePlatformBranding?: boolean
  }
) {
  const header = getBrandedEmailHeader(branding?.logoUrl, branding?.organizationName)
  const footer = getBrandedEmailFooter(branding?.organizationName, branding?.hidePlatformBranding)
  const buttonColor = branding?.primaryColor || '#1E8E5A'

  return {
    subject: `New MOSCA Invitation Request - ${requesterName} - ${level}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${header}
        <h2 style="color: #1f2937;">New Request Assigned to You</h2>
        <p>Hi ${partnerName},</p>
        <p>You've been automatically assigned a new MOSCA invitation request:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${requesterName}</p>
          <p><strong>Email:</strong> ${requesterEmail}</p>
          ${requesterPhone ? `<p><strong>Phone:</strong> ${requesterPhone}</p>` : ''}
          ${referralCode ? `<p><strong>Referral Code Used:</strong> ${referralCode}</p>` : ''}
          <p><strong>Requested Level:</strong> ${level}</p>
        </div>
        <h3>YOUR NEXT STEPS:</h3>
        <ol>
          <li>Log into MOSCA Back Office</li>
          <li>Send official MOSCA invitation to ${requesterEmail}</li>
          <li>Update status in your Strategic Partner Hub: "Mark as Invited"</li>
          <li>Schedule onboarding with MOSCA Certified Specialist</li>
          <li>Update status: "Mark as Onboarding Scheduled"</li>
          <li>After Activation Complete, confirm in Hub: "Confirm Activation"</li>
        </ol>
        <p style="margin: 30px 0;">
          <a href="${dashboardUrl}" style="background: ${buttonColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Your Strategic Partner Hub
          </a>
        </p>
        <p><strong>Important:</strong> Please complete within 24-48 hours.</p>
        ${footer}
      </div>
    `
  }
}

export function getNewStrategicPartnerWelcomeEmail(
  name: string,
  email: string,
  tempPassword: string,
  loginUrl: string
) {
  return {
    subject: 'Welcome to MOSCA - You\'re now a Strategic Partner!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations ${name}!</h2>
        <p>Your Wallet Activation is complete. You're now a MOSCA Strategic Partner with 3 Request Slots available.</p>
        <h3>Access your Strategic Partner Hub:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p style="margin: 30px 0;">
          <a href="${loginUrl}" style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Your Hub
          </a>
        </p>
        <p>On first login, you'll be prompted to:</p>
        <ol>
          <li>Create a new password</li>
          <li>Enter your MOSCA Strategic Partner Referral Code</li>
        </ol>
        <p>You can now help 3 people Activate Their Wallets and join the MOSCA Community.</p>
        <p>Welcome to the Movement!</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Strategic Partner Hub<br>
          citizenactivation.com
        </p>
      </div>
    `
  }
}

export function getAdminWelcomeEmail(
  name: string,
  email: string,
  tempPassword: string,
  roleText: string,
  referralCode: string,
  subdomain: string,
  isFounder: boolean = false
) {
  const loginUrl = `https://${subdomain}.citizenactivation.com/login`
  const subdomainUrl = `https://${subdomain}.citizenactivation.com`

  return {
    subject: `Welcome to Citizen Activation System - ${roleText} Account Created`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #f9fafb; border-bottom: 3px solid #1E8E5A;">
          <h1 style="margin: 0; color: #1f2937; font-size: 28px;">Citizen Activation System</h1>
        </div>
        
        <h2 style="color: #1f2937;">Welcome, ${name}!</h2>
        <p>Your ${roleText} account has been successfully created by the Master Admin.</p>
        
        ${isFounder ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">🎉 FOUNDER STATUS</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">You're part of the exclusive Founders Beta with lifetime access!</p>
          </div>
        ` : ''}
        
        <h3 style="color: #1f2937; margin-top: 30px;">Your Login Credentials</h3>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${tempPassword}</code></p>
          <p style="margin: 5px 0;"><strong>Your Referral Code:</strong> <code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${referralCode}</code></p>
          <p style="margin: 5px 0;"><strong>Your Subdomain Link:</strong> <a href="${subdomainUrl}" style="color: #1E8E5A;">${subdomainUrl}</a></p>
        </div>
        
        <p style="margin: 30px 0;">
          <a href="${loginUrl}" style="background: #1E8E5A; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Login to Your Dashboard
          </a>
        </p>
        
        <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1e40af;">⚠️ IMPORTANT: First Login</p>
          <p style="margin: 5px 0 0 0; color: #1e3a8a;">You will be required to change your password immediately upon first login.</p>
        </div>
        
        <h3 style="color: #1f2937; margin-top: 30px;">What's Next?</h3>
        <ol style="line-height: 1.8;">
          <li>Click the login button above</li>
          <li>Enter your email and temporary password</li>
          <li>Create a new secure password</li>
          <li>Explore your dashboard and get started!</li>
        </ol>
        
        ${subdomain ? `
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 30px 0;">
            <p style="margin: 0; font-weight: bold; color: #15803d;">📢 Share Your Link</p>
            <p style="margin: 5px 0 0 0; color: #166534;">All requests submitted through your subdomain link will be automatically assigned to you:</p>
            <p style="margin: 10px 0 0 0;"><a href="${subdomainUrl}" style="color: #15803d; font-weight: bold;">${subdomainUrl}</a></p>
          </div>
        ` : ''}
        
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          Citizen Activation System<br>
          Strategic Partner Hub<br>
          <a href="https://hub.citizenactivation.com" style="color: #1E8E5A;">hub.citizenactivation.com</a>
        </p>
      </div>
    `
  }
}
