import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Strategic Partner Hub <notifications@m.citizenactivation.com>',
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

// Email Templates

export function getRequesterConfirmationEmail(name: string, level: string) {
  return {
    subject: `MOSCA Invitation Request Received - ${level} Activation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you, ${name}!</h2>
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
        <hr>
        <p style="font-size: 12px; color: #666;">
          Strategic Partner Hub<br>
          citizenactivation.com
        </p>
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
  dashboardUrl: string
) {
  return {
    subject: `New MOSCA Invitation Request - ${requesterName} - ${level}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Request Assigned to You</h2>
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
          <a href="${dashboardUrl}" style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Your Strategic Partner Hub
          </a>
        </p>
        <p><strong>Important:</strong> Please complete within 24-48 hours.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          Strategic Partner Hub<br>
          citizenactivation.com
        </p>
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
