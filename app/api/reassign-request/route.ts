import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Main Admin can manually reassign
    if (session.user.role !== 'MAIN_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { requestId, newPartnerId, reason } = body

    if (!requestId || !newPartnerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the request with current partner
    const req = await prisma.request.findUnique({
      where: { id: requestId },
      include: { assignedPartner: true }
    })

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Check if current admin is the initiator (owns this request)
    // Only the initiator (admin whose link was used) can reassign
    if (req.initiatorId && req.initiatorId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Cannot reassign - you are not the initiator of this request',
        message: 'This request came from another admin\'s subdomain link. Only they can reassign it.'
      }, { status: 403 })
    }

    const oldPartnerId = req.assignedPartnerId

    // Get new partner
    const newPartner = await prisma.strategicPartner.findUnique({
      where: { id: newPartnerId }
    })

    if (!newPartner) {
      return NextResponse.json({ error: 'Strategic Partner not found' }, { status: 404 })
    }

    // Check if new partner has available slots
    if (newPartner.slotsUsed >= newPartner.slotsAvailable) {
      return NextResponse.json({ error: 'Strategic Partner has no available slots' }, { status: 400 })
    }

    // Update old partner (free up slot if not activated)
    if (oldPartnerId && req.status !== 'Activated') {
      const oldPartner = await prisma.strategicPartner.findUnique({
        where: { id: oldPartnerId }
      })

      if (oldPartner && oldPartner.slotsUsed > 0) {
        const newSlotsUsed = oldPartner.slotsUsed - 1
        await prisma.strategicPartner.update({
          where: { id: oldPartnerId },
          data: {
            slotsUsed: newSlotsUsed,
            status: newSlotsUsed < 3 ? 'Active' : 'Full'
          }
        })
      }
    }

    // Update new partner (add slot)
    const newSlotsUsed = newPartner.slotsUsed + 1
    await prisma.strategicPartner.update({
      where: { id: newPartnerId },
      data: {
        slotsUsed: newSlotsUsed,
        totalAssigned: newPartner.totalAssigned + 1,
        lastAssigned: new Date(),
        status: newSlotsUsed >= 3 ? 'Full' : 'Active'
      }
    })

    // Update request
    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: {
        assignedPartnerId: newPartnerId,
        assignmentType: 'Manual',
        dateAssigned: new Date(),
        notes: reason ? `Reassigned: ${reason}` : 'Manually reassigned by Main Admin'
      }
    })

    // Send email to new partner
    await sendEmail({
      to: newPartner.email,
      subject: 'New Private Invitation Request Assigned (Reassigned)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1E8E5A;">New Request Assigned to You</h2>
          
          <p>A Private Invitation request has been reassigned to you.</p>

          <h3>Requester Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${req.requesterFirstName} ${req.requesterLastName}</li>
            <li><strong>Email:</strong> ${req.requesterEmail}</li>
            <li><strong>Phone:</strong> ${req.requesterPhone}</li>
            <li><strong>Activation Level:</strong> ${req.activationLevel}</li>
          </ul>

          ${reason ? `<p><strong>Reassignment Reason:</strong> ${reason}</p>` : ''}

          <div style="margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Dashboard
            </a>
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true, request: updatedRequest })

  } catch (error) {
    console.error('Reassign request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
