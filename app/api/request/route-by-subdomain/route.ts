import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, getRequesterConfirmationEmail, getStrategicPartnerAssignmentEmail } from '@/lib/email'

/**
 * POST /api/request/route-by-subdomain
 * 
 * Routes an incoming request to the correct admin based on subdomain
 * Tracks the initiator (admin whose link was used)
 * Assigns to Strategic Partners via Round Robin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      requesterFirstName,
      requesterLastName,
      requesterEmail,
      requesterPhone,
      referralCodeUsed,
      activationLevel = 'Citizen',
      subdomain // Pass subdomain explicitly from form
    } = body

    // Validate required fields
    if (!requesterFirstName || !requesterLastName || !requesterEmail || !requesterPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Detect subdomain from header or body
    const detectedSubdomain = subdomain || request.headers.get('x-subdomain')

    if (!detectedSubdomain) {
      return NextResponse.json(
        { error: 'No subdomain detected - cannot route request' },
        { status: 400 }
      )
    }

    // Find admin by subdomain
    const admin = await prisma.admin.findFirst({
      where: {
        subdomain: {
          equals: detectedSubdomain,
          mode: 'insensitive'
        },
        status: 'Active' // Only active admins
      },
      include: {
        team: {
          include: {
            strategicPartners: {
              where: {
                status: 'Active',
                slotsAvailable: {
                  gt: 0 // At least 1 slot available
                }
              },
              orderBy: {
                lastAssigned: 'asc' // Even rotation - assign to least recently assigned
              }
            }
          }
        }
      }
    })

    if (!admin) {
      return NextResponse.json(
        { 
          error: 'Subdomain not found',
          message: 'This subdomain does not exist or has been deactivated'
        },
        { status: 404 }
      )
    }

    // Additional status check (should already be filtered by where clause, but double-check)
    if (admin.status !== 'Active') {
      return NextResponse.json(
        { 
          error: 'Account inactive',
          message: 'This subdomain is no longer active. Please contact support if you believe this is an error.'
        },
        { status: 403 }
      )
    }

    if (!admin.team) {
      return NextResponse.json(
        { error: 'Admin team not found' },
        { status: 404 }
      )
    }

    // Check if there are available Strategic Partners
    const availablePartners = admin.team.strategicPartners || []

    if (availablePartners.length === 0) {
      return NextResponse.json(
        { 
          error: 'No available Strategic Partners',
          message: 'All Strategic Partners are full or no partners added yet'
        },
        { status: 400 }
      )
    }

    // Round Robin: Assign to first partner (already sorted by lastAssigned)
    const assignedPartner = availablePartners[0]

    // Create request with initiator tracking
    const newRequest = await prisma.request.create({
      data: {
        teamId: admin.teamId!,
        initiatorId: admin.id, // Track who initiated this request (link owner)
        requesterFirstName,
        requesterLastName,
        requesterEmail,
        requesterPhone,
        referralCodeUsed: referralCodeUsed || null,
        activationLevel,
        assignedPartnerId: assignedPartner.id,
        assignmentType: 'Auto',
        status: 'Assigned',
        dateSubmitted: new Date(),
        dateAssigned: new Date()
      }
    })

    // Update Strategic Partner stats
    await prisma.strategicPartner.update({
      where: { id: assignedPartner.id },
      data: {
        slotsUsed: assignedPartner.slotsUsed + 1,
        slotsAvailable: assignedPartner.slotsAvailable - 1,
        lastAssigned: new Date(),
        totalAssigned: assignedPartner.totalAssigned + 1
      }
    })

    // Send emails with branding
    const branding = {
      logoUrl: admin.team.logoUrl,
      organizationName: admin.team.organizationName || admin.team.name,
      primaryColor: admin.team.primaryColor,
      hidePlatformBranding: admin.team.hidePlatformBranding
    }

    const requesterName = `${requesterFirstName} ${requesterLastName}`
    const partnerName = `${assignedPartner.firstName} ${assignedPartner.lastName}`

    // Email to requester
    const requesterEmailTemplate = getRequesterConfirmationEmail(
      requesterName,
      activationLevel,
      branding
    )
    await sendEmail({
      to: requesterEmail, // Use the actual email address from request body
      subject: requesterEmailTemplate.subject,
      html: requesterEmailTemplate.html,
      from: admin.team.emailFromName 
        ? `${admin.team.emailFromName} <notifications@m.citizenactivation.com>`
        : undefined
    })

    // Email to Strategic Partner
    const dashboardUrl = process.env.NEXTAUTH_URL + '/dashboard'
    const partnerEmailTemplate = getStrategicPartnerAssignmentEmail(
      partnerName,
      requesterName,
      requesterEmail, // Use the actual email address from request body
      requesterPhone,
      activationLevel,
      referralCodeUsed,
      dashboardUrl,
      branding
    )
    await sendEmail({
      to: assignedPartner.email,
      subject: partnerEmailTemplate.subject,
      html: partnerEmailTemplate.html,
      from: admin.team.emailFromName 
        ? `${admin.team.emailFromName} <notifications@m.citizenactivation.com>`
        : undefined
    })

    return NextResponse.json({
      success: true,
      message: 'Request received and assigned',
      request: {
        id: newRequest.id,
        assignedTo: `${assignedPartner.firstName} ${assignedPartner.lastName}`,
        status: newRequest.status
      },
      initiator: {
        adminId: admin.id,
        subdomain: detectedSubdomain,
        name: `${admin.firstName} ${admin.lastName}`
      }
    })

  } catch (error: any) {
    console.error('Request routing error:', error)
    return NextResponse.json(
      { error: 'Failed to route request', details: error.message },
      { status: 500 }
    )
  }
}
