import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Find Main Admin
    const mainAdmin = await prisma.admin.findFirst({
      where: { email: 'mzsamantha01@gmail.com' }
    })

    if (!mainAdmin) {
      return NextResponse.json({ error: 'Main Admin not found' }, { status: 404 })
    }

    // Check if already has team
    if (mainAdmin.teamId) {
      const team = await prisma.team.findUnique({ 
        where: { id: mainAdmin.teamId } 
      })
      return NextResponse.json({ 
        message: 'Already has team', 
        team,
        alreadyExists: true
      })
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name: 'MzSamantha - Main System',
        adminId: mainAdmin.id,
        tierType: 'FullSystem',
        status: 'Active'
      }
    })

    // Link admin to team
    await prisma.admin.update({
      where: { id: mainAdmin.id },
      data: { teamId: team.id }
    })

    return NextResponse.json({ 
      success: true, 
      team,
      message: 'Team created and linked successfully'
    })
  } catch (error: any) {
    console.error('Error fixing Main Admin team:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
