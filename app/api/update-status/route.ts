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

    const body = await request.json()
    const { requestId, status } = body

    if (!requestId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the request
    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: { assignedPartner: true, team: true }
    })

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Verify permission: Strategic Partner can only update their own requests
    if (session.user.type === 'partner' && req.assignedPartnerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update status
    const now = new Date()
    const updateData: any = { status }
    const oldStatus = req.status

    if (status === 'Invited' && !req.dateInvited) {
      updateData.dateInvited = now
    } else if (status === 'OnboardingScheduled' && !req.dateOnboardingScheduled) {
      updateData.dateOnboardingScheduled = now
    } else if (status === 'Activated' && oldStatus !== 'Activated') {
      updateData.dateActivated = now

      // Create new Strategic Partner account
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      const newPartner = await prisma.strategicPartner.create({
        data: {
          teamId: req.teamId,
          firstName: req.requesterFirstName,
          lastName: req.requesterLastName,
          email: req.requesterEmail,
          passwordHash: hashedPassword,
          phone: req.requesterPhone,
          referralCode: 'TEMP-' + Date.now(), // Temporary - they'll enter their referral code on first login
          slotsUsed: 0,
          slotsAvailable: 3,
          status: 'Active',
          activationLevel: req.activationLevel as any,
          activationDate: now,
          originalRequestId: req.id
        }
      })

      updateData.becamePartnerId = newPartner.id

      // Send welcome email
      const requesterFullName = `${req.requesterFirstName} ${req.requesterLastName}`
      const welcomeEmail = getNewStrategicPartnerWelcomeEmail(
        requesterFullName,
        req.requesterEmail,
        tempPassword,
        `${process.env.NEXTAUTH_URL}/login`
      )
      await sendEmail({
        to: req.requesterEmail,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html
      })

      // NOTE: Slot remains occupied when Activated - partner still owns this relationship
    }

    await prisma.request.update({
      where: { id: requestId },
      data: updateData
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
