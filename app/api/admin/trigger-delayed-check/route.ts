import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

/**
 * POST /api/admin/trigger-delayed-check
 * 
 * Manually trigger the delayed request check
 * Master Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Master Admin can manually trigger
    if (session.user.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Only Master Admin can trigger delayed checks' 
      }, { status: 403 })
    }

    // Call the cron endpoint internally
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-prod'
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/cron/check-delayed-requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to trigger check', details: data },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Delayed request check triggered successfully',
      result: data
    })

  } catch (error: any) {
    console.error('Trigger delayed check error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger check', details: error.message },
      { status: 500 }
    )
  }
}
