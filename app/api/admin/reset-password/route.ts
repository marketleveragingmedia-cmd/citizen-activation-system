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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { adminId } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    // Get admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Update password
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        passwordHash: hashedPassword
      }
    })

    // Send email
    await sendEmail({
      to: admin.email,
      subject: 'Password Reset - Citizen Activation System',
      text: `Your password has been reset.\n\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nLogin: https://hub.citizenactivation.com/login`,
      html: `
        <h2>Password Reset</h2>
        <p>Your password has been reset by a Master Admin.</p>
        <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
        <p>Please log in and change your password immediately.</p>
        <p><a href="https://hub.citizenactivation.com/login">Login Now</a></p>
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Password reset email sent'
    })

  } catch (error: any) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
