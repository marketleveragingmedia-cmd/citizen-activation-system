import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { sendEmail, getNewStrategicPartnerWelcomeEmail } from '@/lib/email'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Main Admin can add Strategic Partners
    if (session.user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, referralCode, activationLevel } = body

    // Validation
    if (!firstName || !lastName || !email || !phone || !referralCode || !activationLevel) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if email already exists
    const existingPartner = await prisma.strategicPartner.findUnique({
      where: { email }
    })

    if (existingPartner) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check if referral code already exists
    const existingCode = await prisma.strategicPartner.findUnique({
      where: { referralCode }
    })

    if (existingCode) {
      return NextResponse.json({ error: 'Referral code already exists' }, { status: 400 })
    }

    // Get the main team (for now, all Strategic Partners go to main team)
    const team = await prisma.team.findFirst({
      where: { status: 'Active' }
    })

    if (!team) {
      return NextResponse.json({ error: 'No active team found' }, { status: 500 })
    }

    // Generate temp password
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create Strategic Partner
    const newPartner = await prisma.strategicPartner.create({
      data: {
        teamId: team.id,
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
        phone,
        referralCode,
        slotsUsed: 0,
        slotsAvailable: 3,
        status: 'Active',
        activationLevel: activationLevel as any,
        activationDate: new Date()
      }
    })

    // Send welcome email
    const fullName = `${firstName} ${lastName}`
    const welcomeEmail = getNewStrategicPartnerWelcomeEmail(
      fullName,
      email,
      tempPassword,
      `${process.env.NEXTAUTH_URL}/login`
    )

    await sendEmail({
      to: email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html
    })

    return NextResponse.json({ 
      success: true, 
      partner: {
        id: newPartner.id,
        firstName: newPartner.firstName,
        lastName: newPartner.lastName,
        email: newPartner.email
      }
    })

  } catch (error) {
    console.error('Add Strategic Partner error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
