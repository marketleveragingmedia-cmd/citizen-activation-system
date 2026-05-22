import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      count: admins.length,
      accounts: admins
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
