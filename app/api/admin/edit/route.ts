import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    })

    if (!currentAdmin || currentAdmin.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { adminId, firstName, lastName, email, phone, subdomain } = await request.json()

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 })
    }

    // Validate subdomain if provided
    if (subdomain) {
      // Check if subdomain is already taken by another admin
      const existing = await prisma.admin.findFirst({
        where: {
          subdomain,
          id: { not: adminId }
        }
      })

      if (existing) {
        return NextResponse.json({ error: 'Subdomain already taken' }, { status: 400 })
      }

      // Validate subdomain format (3-20 chars, alphanumeric + hyphens)
      if (subdomain.length < 3 || subdomain.length > 20 || !/^[a-z0-9-]+$/.test(subdomain)) {
        return NextResponse.json({ error: 'Invalid subdomain format' }, { status: 400 })
      }

      // Check reserved subdomains
      const reserved = ['www', 'admin', 'api', 'hub', 'master', 'app', 'beta', 'staging']
      if (reserved.includes(subdomain)) {
        return NextResponse.json({ error: 'Subdomain is reserved' }, { status: 400 })
      }
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        firstName,
        lastName,
        email,
        phone,
        subdomain: subdomain || null
      }
    })

    return NextResponse.json({ 
      success: true, 
      admin: updatedAdmin 
    })

  } catch (error: any) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
