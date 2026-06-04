import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, secretKey } = await request.json()

    // Secret key protection (you can change this)
    if (secretKey !== 'RESET_MASTER_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    if (admin.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Not a Master Admin account' }, { status: 403 })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.admin.update({
      where: { email },
      data: { passwordHash }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Master Admin password reset successfully',
      email: admin.email,
      role: admin.role
    })

  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Also add a GET to check if account exists
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const secretKey = searchParams.get('secret')

    if (secretKey !== 'RESET_MASTER_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdDate: true
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      admin
    })

  } catch (error: any) {
    console.error('Check admin error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
