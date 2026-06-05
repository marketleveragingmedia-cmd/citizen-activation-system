import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, moscaCode, subdomainOption1, subdomainOption2, walletInfo } = body

    if (!firstName || !lastName || !email || !phone || !moscaCode || !subdomainOption1 || !subdomainOption2 || !walletInfo) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } })
    if (existingAdmin) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    // Check if already pending
    const existingPending = await prisma.founderPending.findFirst({ where: { email } })
    if (existingPending) {
      return NextResponse.json({ error: 'You already have a pending application' }, { status: 400 })
    }

    // Create pending Founder
    const pending = await prisma.founderPending.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        moscaCode,
        subdomainOption1,
        subdomainOption2,
        walletInfo,
        paymentMethod: 'MOSCA',
        status: 'Pending'
      }
    })

    // Send pending email to user
    await sendEmail({
      to: email,
      subject: 'Founders Application Received - Verification Pending',
      html: `
        <h2>Thank you for your Founders application!</h2>
        <p>Hi ${firstName},</p>
        <p>We've received your MOSCA wallet payment application. Our team will verify your payment within 24-48 hours.</p>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>We'll verify your payment to mzsamantha01@gmail.com</li>
          <li>Once confirmed, your Founder account will be activated automatically</li>
          <li>You'll receive login credentials and your custom link</li>
        </ul>
        <p><strong>Your Details:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>MOSCA Code: ${moscaCode}</li>
          <li>Primary Subdomain: ${subdomainOption1}.citizenactivation.com</li>
          <li>Backup Subdomain: ${subdomainOption2}.citizenactivation.com</li>
        </ul>
        <p>Questions? Email support@citizenactivation.com</p>
      `
    })

    // Send notification to admin
    await sendEmail({
      to: 'mzsamantha01@gmail.com',
      subject: '🔔 New MOSCA Founder Application - Action Required',
      html: `
        <h2>New MOSCA Founder Application</h2>
        <p><strong>Applicant:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>MOSCA Code:</strong> ${moscaCode}</p>
        <p><strong>Wallet/TX Info:</strong></p>
        <pre>${walletInfo}</pre>
        <p><strong>Subdomain Options:</strong></p>
        <ul>
          <li>Primary: ${subdomainOption1}.citizenactivation.com</li>
          <li>Backup: ${subdomainOption2}.citizenactivation.com</li>
        </ul>
        <p><strong>Action Required:</strong></p>
        <ol>
          <li>Verify $997 payment in MOSCA wallet (mzsamantha01@gmail.com)</li>
          <li>Go to Master Admin → Founders page</li>
          <li>Click "Approve" to activate account</li>
        </ol>
      `
    })

    return NextResponse.json({ success: true, pendingId: pending.id })
  } catch (error: any) {
    console.error('MOSCA Founder submission error:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 500 })
  }
}
