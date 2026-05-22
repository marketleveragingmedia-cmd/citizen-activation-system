import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assignRequestToPartner, updatePartnerAfterAssignment } from '@/lib/assignment'
import { 
  sendEmail, 
  getRequesterConfirmationEmail, 
  getStrategicPartnerAssignmentEmail 
} from '@/lib/email'
import { ActivationLevel } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      firstName,
      lastName,
      email,
      phone,
      referralCode,
      activationLevel
    } = body

    // Validation
    if (!firstName || !lastName || !email || !phone || !activationLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For MVP, we'll use the first active team (Main Admin's team)
    // In production, this would be determined by domain/subdomain routing
    const team = await prisma.team.findFirst({
      where: { status: 'Active' }
    })

    if (!team) {
      return NextResponse.json(
        { error: 'No active team found' },
        { status: 500 }
      )
    }

    // Assign to Strategic Partner
    const assignment = await assignRequestToPartner(
      team.id,
      referralCode || undefined
    )

    if (!assignment) {
      return NextResponse.json(
        { error: 'No available Strategic Partners. Please try again later.' },
        { status: 503 }
      )
    }

    // Create request
    const newRequest = await prisma.request.create({
      data: {
        teamId: team.id,
        requesterFirstName: firstName,
        requesterLastName: lastName,
        requesterEmail: email,
        requesterPhone: phone,
        referralCodeUsed: referralCode || null,
        activationLevel: activationLevel as ActivationLevel,
        assignedPartnerId: assignment.partnerId,
        assignmentType: assignment.assignmentType,
        dateAssigned: new Date()
      },
      include: {
        assignedPartner: true
      }
    })

    // Update Strategic Partner slots
    await updatePartnerAfterAssignment(assignment.partnerId)

    // Send confirmation email to requester
    const requesterEmail = getRequesterConfirmationEmail(
      `${firstName} ${lastName}`,
      activationLevel
    )
    await sendEmail({
      to: email,
      subject: requesterEmail.subject,
      html: requesterEmail.html
    })

    // Send assignment email to Strategic Partner
    if (newRequest.assignedPartner) {
      const partnerFullName = `${newRequest.assignedPartner.firstName} ${newRequest.assignedPartner.lastName}`
      const requesterFullName = `${firstName} ${lastName}`
      const partnerEmail = getStrategicPartnerAssignmentEmail(
        partnerFullName,
        requesterFullName,
        newRequest.requesterEmail,
        newRequest.requesterPhone,
        activationLevel,
        referralCode || null,
        `${process.env.NEXTAUTH_URL}/dashboard`
      )
      await sendEmail({
        to: newRequest.assignedPartner.email,
        subject: partnerEmail.subject,
        html: partnerEmail.html
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully',
      requestId: newRequest.id
    })

  } catch (error) {
    console.error('Request submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
