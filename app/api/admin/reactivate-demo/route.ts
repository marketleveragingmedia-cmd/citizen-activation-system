import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Quick utility to reactivate demo account for testing
// DELETE THIS FILE after demo is reactivated
export async function POST() {
  try {
    const updated = await prisma.admin.updateMany({
      where: {
        subdomain: 'demo',
        email: 'mzsamantha01+demo@gmail.com'
      },
      data: {
        status: 'Active'
      }
    })

    const demoAccount = await prisma.admin.findFirst({
      where: {
        subdomain: 'demo'
      },
      select: {
        subdomain: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        accountType: true
      }
    })

    return NextResponse.json({
      success: true,
      updated: updated.count,
      account: demoAccount
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
