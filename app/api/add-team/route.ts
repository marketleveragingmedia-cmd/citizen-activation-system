import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Master Admin, Main Admin, OR Team Admin can add teams
    if (session.user.role !== 'MASTER_ADMIN' && session.user.role !== 'MAIN_ADMIN' && session.user.role !== 'TEAM_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      teamName, 
      adminFirstName,
      adminLastName, 
      adminEmail, 
      adminPhone,
      moscaReferralCode,
      tierType, // 'full-system' or 'solo-org'
      customDomain,
      logoUrl
    } = body

    // Validation
    if (!teamName || !adminFirstName || !adminLastName || !adminEmail || !adminPhone || !moscaReferralCode || !tierType) {
      return NextResponse.json({ error: 'All fields are required (including MOSCA Referral Code)' }, { status: 400 })
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    let team
    let admin

    // Check if this is Master Admin or Main Admin (creates new team) vs Team Admin (adds to existing)
    if (session.user.role === 'MASTER_ADMIN' || session.user.role === 'MAIN_ADMIN') {
      // Main Admin: Create NEW team with new admin as owner
      team = await prisma.team.create({
        data: {
          name: teamName,
          adminId: 'pending',
          tierType: tierType === 'full-system' ? 'FullSystem' : 'SoloOrg',
          status: 'Active'
        }
      })

      admin = await prisma.admin.create({
        data: {
          teamId: team.id,
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail,
          passwordHash: hashedPassword,
          referralCode: moscaReferralCode,
          role: 'TEAM_ADMIN',
          status: 'Active'
        }
      })

      await prisma.team.update({
        where: { id: team.id },
        data: { adminId: admin.id }
      })
    } else {
      // Team Admin: Add admin to THEIR existing team
      const currentAdmin = await prisma.admin.findUnique({
        where: { id: session.user.id },
        include: { team: true }
      })

      if (!currentAdmin || !currentAdmin.team) {
        return NextResponse.json({ error: 'Your team not found' }, { status: 404 })
      }

      team = currentAdmin.team

      admin = await prisma.admin.create({
        data: {
          teamId: team.id,
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail,
          passwordHash: hashedPassword,
          referralCode: moscaReferralCode,
          role: 'TEAM_ADMIN',
          status: 'Active'
        }
      })
    }

    // Send welcome email
    await sendEmail({
      to: adminEmail,
      subject: 'Welcome to Citizen Activation System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E8E5A;">Welcome to Citizen Activation System!</h2>
          
          <p>Hello ${adminFirstName} ${adminLastName},</p>
          
          <p>Your ${tierType === 'full-system' ? 'Full System Access' : 'Solo Organization'} account has been created.</p>

          <h3>Login Credentials:</h3>
          <ul>
            <li><strong>URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login">${process.env.NEXTAUTH_URL}/login</a></li>
            <li><strong>Email:</strong> ${adminEmail}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
          </ul>

          <p><strong>Please change your password after your first login.</strong></p>

          ${tierType === 'full-system' ? `
            <h3>Your Capabilities:</h3>
            <ul>
              <li>Add Strategic Partners (unlimited)</li>
              <li>Add sub-teams and manage multiple organizations</li>
              <li>View all requests across your team structure</li>
              <li>Receive escalation alerts</li>
              <li>Complete system access</li>
            </ul>
          ` : `
            <h3>Your Capabilities:</h3>
            <ul>
              <li>Add Strategic Partners to help manage requests</li>
              <li>Manage your community's MOSCA invitation requests</li>
              <li>View your organization's data</li>
              <li>Receive escalation alerts</li>
            </ul>
          `}

          <div style="margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/login" 
               style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Login Now
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact support.
          </p>
        </div>
      `
    })

    return NextResponse.json({ 
      success: true, 
      team: {
        id: team.id,
        name: teamName,
        adminName: `${adminFirstName} ${adminLastName}`,
        adminEmail,
        tempPassword
      }
    })

  } catch (error) {
    console.error('Add team error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
