import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

/**
 * GET /api/cron/check-delayed-requests
 * 
 * Cron job to check for delayed requests (3+ days in Assigned status)
 * Sends email to initiator and optionally Main Admin
 * 
 * Should be called daily via Vercel Cron or external service
 * Authorization: Check for cron secret or internal call
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-prod'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid cron secret' },
        { status: 401 }
      )
    }

    // Find requests that are:
    // 1. Status = Assigned
    // 2. dateAssigned >= 3 days ago
    // 3. Not already escalated (escalated = false)
    
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const delayedRequests = await prisma.request.findMany({
      where: {
        status: 'Assigned',
        dateAssigned: {
          lte: threeDaysAgo
        },
        escalated: false // Only alert once
      },
      include: {
        assignedPartner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (delayedRequests.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No delayed requests found',
        count: 0
      })
    }

    // Get initiator info for each request
    const initiatorIds = [...new Set(delayedRequests.map(r => r.initiatorId).filter(Boolean))] as string[]
    
    const initiators = await prisma.admin.findMany({
      where: {
        id: { in: initiatorIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        subdomain: true,
        teamId: true
      }
    })

    const initiatorsMap = new Map(initiators.map(i => [i.id, i]))

    // Also get Main Admins for CC (optional)
    const mainAdmins = await prisma.admin.findMany({
      where: {
        role: 'MAIN_ADMIN',
        status: 'Active'
      },
      select: {
        email: true,
        firstName: true
      }
    })

    let alertsSent = 0
    let errors = 0

    // Send alerts for each delayed request
    for (const request of delayedRequests) {
      try {
        const initiator = request.initiatorId ? initiatorsMap.get(request.initiatorId) : null

        if (!initiator) {
          console.warn(`No initiator found for request ${request.id}`)
          continue
        }

        const daysSince = Math.floor(
          (Date.now() - new Date(request.dateAssigned!).getTime()) / (1000 * 60 * 60 * 24)
        )

        const partnerName = request.assignedPartner
          ? `${request.assignedPartner.firstName} ${request.assignedPartner.lastName}`
          : 'Unassigned'

        // Send email to initiator
        await sendEmail({
          to: initiator.email,
          subject: '⚠️ Delayed Request Alert - Action Needed',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h2 style="color: #92400E; margin-top: 0;">⚠️ Delayed Request Alert</h2>
                <p style="color: #92400E; margin-bottom: 0;">
                  A request from your subdomain has been assigned for <strong>${daysSince} days</strong> with no progress.
                </p>
              </div>

              <h3 style="color: #1E8E5A;">Request Details:</h3>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Requester:</strong> ${request.requesterFirstName} ${request.requesterLastName}</p>
                <p><strong>Email:</strong> ${request.requesterEmail}</p>
                <p><strong>Phone:</strong> ${request.requesterPhone}</p>
                <p><strong>Assigned to:</strong> ${partnerName}</p>
                <p><strong>Date Assigned:</strong> ${new Date(request.dateAssigned!).toLocaleDateString()}</p>
                <p><strong>Days Since Assignment:</strong> ${daysSince} days</p>
              </div>

              <h3 style="color: #1E8E5A;">Recommended Actions:</h3>
              <ul style="color: #374151;">
                <li>Contact the Strategic Partner to check status</li>
                <li>Follow up with the requester directly</li>
                <li>Consider reassigning if no response</li>
                <li>Update the request status if already completed</li>
              </ul>

              <p style="margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                   style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Dashboard
                </a>
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="font-size: 12px; color: #666;">
                This is an automated alert from the Citizen Activation System.<br>
                You are receiving this because a request from your subdomain (${initiator.subdomain}.citizenactivation.com) has been delayed.
              </p>
            </div>
          `
        })

        // Mark as escalated so we don't send again
        await prisma.request.update({
          where: { id: request.id },
          data: {
            escalated: true,
            escalatedDate: new Date()
          }
        })

        alertsSent++

      } catch (err) {
        console.error(`Failed to send alert for request ${request.id}:`, err)
        errors++
      }
    }

    // Optional: Send summary to Main Admins
    if (mainAdmins.length > 0 && delayedRequests.length > 0) {
      try {
        const summaryEmails = mainAdmins.map(admin => admin.email)
        
        await sendEmail({
          to: summaryEmails[0], // Send to first Main Admin
          subject: `📊 Delayed Request Summary - ${delayedRequests.length} alerts sent`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E8E5A;">Delayed Request Summary</h2>
              
              <p>The automated alert system sent <strong>${alertsSent}</strong> delayed request alerts.</p>

              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Total Delayed Requests:</strong> ${delayedRequests.length}</p>
                <p><strong>Alerts Sent:</strong> ${alertsSent}</p>
                <p><strong>Errors:</strong> ${errors}</p>
              </div>

              <p>Initiators have been notified to follow up on their delayed requests.</p>

              <p style="margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                   style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Dashboard
                </a>
              </p>
            </div>
          `
        })
      } catch (err) {
        console.error('Failed to send Main Admin summary:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${delayedRequests.length} delayed requests`,
      stats: {
        delayedRequests: delayedRequests.length,
        alertsSent,
        errors
      }
    })

  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process delayed requests', details: error.message },
      { status: 500 }
    )
  }
}
