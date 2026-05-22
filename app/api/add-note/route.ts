import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, note } = body

    if (!requestId || !note) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const req = await prisma.request.findUnique({
      where: { id: requestId }
    })

    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Append note with timestamp and user
    const timestamp = new Date().toISOString()
    const userName = session.user.name || session.user.email
    const newNote = `[${timestamp}] ${userName}: ${note}`
    const updatedNotes = req.notes ? `${req.notes}\n\n${newNote}` : newNote

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { notes: updatedNotes }
    })

    return NextResponse.json({ success: true, notes: updatedRequest.notes })

  } catch (error) {
    console.error('Add note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
