import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Find Main Admin's team
    const mainAdmin = await prisma.admin.findFirst({
      where: { 
        email: 'mzsamantha01@gmail.com',
        role: 'MAIN_ADMIN'
      },
      include: { team: true }
    })

    if (!mainAdmin || !mainAdmin.team) {
      return NextResponse.json({ error: 'Main Admin team not found' }, { status: 404 })
    }

    // Remove Stripe Connect account from Main Admin's team
    // Main Admin uses platform Stripe keys, NOT Connect
    await prisma.team.update({
      where: { id: mainAdmin.team.id },
      data: { stripeAccountId: null }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Stripe Connect removed from Main Admin team',
      note: 'Main Admin uses platform Stripe keys for all payments'
    })
  } catch (error: any) {
    console.error('Error fixing Main Admin Stripe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
