import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel Cron or manual trigger with secret)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'change-this-in-production'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    // Find all requests that are:
    // - Still in "Assigned" status
    // - Submitted more than 3 days ago
    // - Have not been escalated yet (we'll track this with a new field)
    const delayedRequests = await prisma.request.findMany({
      where: {
        status: 'Assigned',
        dateSubmitted: {
          lte: threeDaysAgo
        },
        escalated: false
      },
      include: {
        assignedPartner: {
          include: {
            team: {
              include: {
                admins: true
              }
            }
          }
        }
      }
    })

    let escalatedCount = 0

    for (const request of delayedRequests) {
      if (!request.assignedPartner) continue

      const daysWaiting = Math.floor(
        (Date.now() - new Date(request.dateSubmitted).getTime()) / (1000 * 60 * 60 * 24)
      )

      const team = request.assignedPartner.team
      const teamAdmin = team.admins.find(admin => admin.role === 'TEAM_ADMIN')
      const mainAdmin = await prisma.admin.findFirst({
        where: { role: 'MAIN_ADMIN' }
      })

      // Email to Team Admin
      if (teamAdmin) {
        await sendEmail({
          to: teamAdmin.email,
          subject: `⚠️ Request Delayed ${daysWaiting} Days - Action Required`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E8E5A;">Request Delayed - Your Team Member Needs Follow-Up</h2>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <strong>⚠️ A request has been waiting for ${daysWaiting} days without action.</strong>
              </div>

              <h3>Requester Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${request.requesterFirstName} ${request.requesterLastName}</li>
                <li><strong>Email:</strong> ${request.requesterEmail}</li>
                <li><strong>Phone:</strong> ${request.requesterPhone}</li>
                <li><strong>Activation Level:</strong> ${request.activationLevel}</li>
                <li><strong>Date Submitted:</strong> ${new Date(request.dateSubmitted).toLocaleDateString()}</li>
              </ul>

              <h3>Assigned Strategic Partner:</h3>
              <ul>
                <li><strong>Name:</strong> ${request.assignedPartner.firstName} ${request.assignedPartner.lastName}</li>
                <li><strong>Email:</strong> ${request.assignedPartner.email}</li>
                <li><strong>Phone:</strong> ${request.assignedPartner.phone}</li>
              </ul>

              <h3>Suggested Actions:</h3>
              <ol>
                <li>Contact your Strategic Partner to check the reason for delay</li>
                <li>Reassign to another Strategic Partner if needed</li>
                <li>Update the request status in the Hub</li>
              </ol>

              <div style="margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                   style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Request in Dashboard
                </a>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This is an automated alert from the Strategic Partner Hub.
              </p>
            </div>
          `
        })
      }

      // Email to Main Admin (CC - you stay informed)
      if (mainAdmin) {
        await sendEmail({
          to: mainAdmin.email,
          subject: `[System Alert] Request Delayed ${daysWaiting} Days - Team: ${team.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E8E5A;">System Alert: Delayed Request</h2>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <strong>⚠️ A request has been waiting for ${daysWaiting} days.</strong><br/>
                <strong>Team Admin has been notified.</strong>
              </div>

              <h3>Requester Details:</h3>
              <ul>
                <li><strong>Name:</strong> ${request.requesterFirstName} ${request.requesterLastName}</li>
                <li><strong>Email:</strong> ${request.requesterEmail}</li>
                <li><strong>Phone:</strong> ${request.requesterPhone}</li>
                <li><strong>Activation Level:</strong> ${request.activationLevel}</li>
                <li><strong>Date Submitted:</strong> ${new Date(request.dateSubmitted).toLocaleDateString()}</li>
              </ul>

              <h3>Assigned To:</h3>
              <ul>
                <li><strong>Strategic Partner:</strong> ${request.assignedPartner.firstName} ${request.assignedPartner.lastName}</li>
                <li><strong>Team:</strong> ${team.name}</li>
                <li><strong>Team Admin:</strong> ${teamAdmin?.firstName} ${teamAdmin?.lastName}</li>
              </ul>

              <div style="margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                   style="background: #1E8E5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View All Requests
                </a>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                You are receiving this as Main Admin for system-wide visibility.
              </p>
            </div>
          `
        })
      }

      // Mark as escalated so we don't send duplicate alerts
      await prisma.request.update({
        where: { id: request.id },
        data: { escalated: true }
      })

      escalatedCount++
    }

    return NextResponse.json({
      success: true,
      checked: delayedRequests.length,
      escalated: escalatedCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Check delays cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
