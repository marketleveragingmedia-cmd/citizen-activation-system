import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { adminId } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    // Get admin with team info
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: {
        team: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Determine admin type
    let roleText = 'Admin'
    if (admin.role === 'MAIN_ADMIN') {
      roleText = admin.isFounder ? 'Founder' : 'Main Admin'
    } else if (admin.role === 'TEAM_ADMIN') {
      roleText = 'Team Admin'
    } else if (admin.role === 'ORG_ADMIN') {
      roleText = 'Organization Admin'
    }

    // Send welcome email
    await sendEmail({
      to: admin.email,
      subject: `Welcome to Citizen Activation System - ${roleText}`,
      text: `Welcome to the Citizen Activation System!\n\nRole: ${roleText}\nEmail: ${admin.email}\nReferral Code: ${admin.referralCode}\n\nLogin: https://hub.citizenactivation.com/login\n\nGet started by logging in and exploring your dashboard.`,
      html: `
        <h2>Welcome to Citizen Activation System!</h2>
        <p>Your account has been activated.</p>
        <p><strong>Role:</strong> ${roleText}</p>
        <p><strong>Email:</strong> ${admin.email}</p>
        <p><strong>Your Referral Code:</strong> <code>${admin.referralCode}</code></p>
        ${admin.subdomain ? `<p><strong>Your Link:</strong> <a href="https://${admin.subdomain}.citizenactivation.com">https://${admin.subdomain}.citizenactivation.com</a></p>` : ''}
        <p><a href="https://hub.citizenactivation.com/login">Login to Your Dashboard</a></p>
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Welcome email sent'
    })

  } catch (error: any) {
    console.error('Error resending welcome email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
