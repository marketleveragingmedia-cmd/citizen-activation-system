import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    // Check if strategic partner exists
    const partner = await prisma.strategicPartner.findUnique({
      where: { email }
    })

    const user = admin || partner

    if (!user) {
      // Don't reveal if email exists or not (security)
      return NextResponse.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      })
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in database
    if (admin) {
      // Note: You'll need to add resetToken and resetTokenExpiry fields to Admin model
      // For now, we'll send a temp password instead
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      
      await prisma.admin.update({
        where: { id: admin.id },
        data: { passwordHash: hashedPassword }
      })

      await sendEmail({
        to: email,
        subject: 'Password Reset - Citizen Activation Hub',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            
            <p>Hello ${admin.firstName} ${admin.lastName},</p>
            
            <p>We received a request to reset your password for the Citizen Activation Hub.</p>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Your New Temporary Password:</strong></p>
              <p style="font-size: 18px; font-family: monospace; background: white; padding: 10px; border-radius: 3px;">
                ${tempPassword}
              </p>
            </div>

            <p><strong>Please login and change your password immediately.</strong></p>

            <p style="margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/login" 
                 style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to Change Password
              </a>
            </p>

            <p style="color: #666; font-size: 14px;">
              If you did not request a password reset, please contact support immediately.
            </p>

            <hr>
            <p style="font-size: 12px; color: #666;">
              Strategic Partner Hub<br>
              citizenactivation.com
            </p>
          </div>
        `
      })
    } else if (partner) {
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(tempPassword, 10)
      
      await prisma.strategicPartner.update({
        where: { id: partner.id },
        data: { passwordHash: hashedPassword }
      })

      await sendEmail({
        to: email,
        subject: 'Password Reset - Strategic Partner Hub',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            
            <p>Hello ${partner.firstName} ${partner.lastName},</p>
            
            <p>We received a request to reset your password for your Strategic Partner Hub.</p>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Your New Temporary Password:</strong></p>
              <p style="font-size: 18px; font-family: monospace; background: white; padding: 10px; border-radius: 3px;">
                ${tempPassword}
              </p>
            </div>

            <p><strong>Please login and change your password immediately.</strong></p>

            <p style="margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/login" 
                 style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to Change Password
              </a>
            </p>

            <p style="color: #666; font-size: 14px;">
              If you did not request a password reset, please contact support immediately.
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

    return NextResponse.json({ 
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
