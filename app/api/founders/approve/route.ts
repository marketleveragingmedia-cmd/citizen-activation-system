import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    })

    if (!currentAdmin || currentAdmin.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Master Admin only' }, { status: 403 })
    }

    const { pendingId } = await request.json()

    if (!pendingId) {
      return NextResponse.json({ error: 'Pending ID required' }, { status: 400 })
    }

    // Get pending Founder
    const pending = await prisma.founderPending.findUnique({
      where: { id: pendingId }
    })

    if (!pending) {
      return NextResponse.json({ error: 'Pending Founder not found' }, { status: 404 })
    }

    if (pending.status !== 'Pending') {
      return NextResponse.json({ error: 'Founder already processed' }, { status: 400 })
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: pending.email }
    })

    if (existingAdmin) {
      return NextResponse.json({ error: 'Account with this email already exists' }, { status: 400 })
    }

    // Check subdomain availability (primary first, then backup)
    let assignedSubdomain = null
    const subdomain1Check = await prisma.admin.findUnique({
      where: { subdomain: pending.subdomainOption1 }
    })

    if (!subdomain1Check) {
      assignedSubdomain = pending.subdomainOption1
    } else {
      const subdomain2Check = await prisma.admin.findUnique({
        where: { subdomain: pending.subdomainOption2 }
      })
      
      if (!subdomain2Check) {
        assignedSubdomain = pending.subdomainOption2
      } else {
        return NextResponse.json({ error: 'Both subdomain options are now taken' }, { status: 400 })
      }
    }

    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-10) + 'F1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create Founder account
    const founder = await prisma.admin.create({
      data: {
        firstName: pending.firstName,
        lastName: pending.lastName,
        email: pending.email,
        phone: pending.phone,
        subdomain: assignedSubdomain,
        moscaCode: pending.moscaCode,
        passwordHash: hashedPassword,
        role: 'MAIN_ADMIN',
        status: 'Active',
        isFounder: true,
        founderDate: new Date(),
        founderPaymentMethod: 'MOSCA',
        founderPaymentDetails: `MOSCA Wallet: ${pending.walletInfo}`,
      }
    })

    // Create team for Founder
    await prisma.team.create({
      data: {
        name: `${pending.firstName} ${pending.lastName} - Founder Network`,
        adminId: founder.id,
        tierType: 'FullSystem',
        status: 'Active',
        createdByAdminId: founder.id,
      }
    })

    // Update pending status
    await prisma.founderPending.update({
      where: { id: pendingId },
      data: {
        status: 'Approved',
        approvedDate: new Date(),
        approvedByAdminId: currentAdmin.id,
      }
    })

    // Send welcome email to Founder
    await sendEmail({
      to: pending.email,
      subject: '🎉 Founder Account Activated - Welcome!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E8E5A; font-size: 32px; margin-bottom: 10px;">⭐ Welcome, Founder!</h1>
            <p style="font-size: 18px; color: #666;">Your MOSCA Payment Verified - Account Active</p>
          </div>
          
          <div style="background: #f0fdf4; border: 2px solid #1E8E5A; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #1E8E5A; margin-top: 0;">Login Credentials:</h3>
            <p><strong>URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></p>
            <p><strong>Email:</strong> ${pending.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${tempPassword}</code></p>
            <p style="color: #dc2626; font-weight: bold;">⚠️ Please change your password after first login</p>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #92400e;">🔗 Your Custom Link:</h3>
            <p style="font-size: 18px; font-weight: bold; color: #92400e;">${assignedSubdomain}.citizenactivation.com</p>
            <p style="font-size: 14px; color: #92400e; margin-bottom: 0;">Share during MOSCA presentations only</p>
          </div>

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

    // Notify admin of approval
    await sendEmail({
      to: 'mzsamantha01@gmail.com',
      subject: '✅ MOSCA Founder Approved & Activated',
      html: `
        <h2>MOSCA Founder Activated</h2>
        <p><strong>Name:</strong> ${pending.firstName} ${pending.lastName}</p>
        <p><strong>Email:</strong> ${pending.email}</p>
        <p><strong>Subdomain:</strong> ${assignedSubdomain}.citizenactivation.com</p>
        <p><strong>MOSCA Code:</strong> ${pending.moscaCode}</p>
        <p><strong>Status:</strong> ✅ Account Created & Active</p>
        <p><strong>Approved by:</strong> ${currentAdmin.firstName} ${currentAdmin.lastName}</p>
      `
    })

    return NextResponse.json({ 
      success: true, 
      founder: {
        id: founder.id,
        email: founder.email,
        subdomain: assignedSubdomain
      }
    })

  } catch (error: any) {
    console.error('Founder approval error:', error)
    return NextResponse.json({ error: error.message || 'Failed to approve Founder' }, { status: 500 })
  }
}
