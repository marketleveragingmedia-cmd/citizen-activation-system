import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admins/search?q=john&role=TEAM_ADMIN
 * 
 * Search for admins by name, email, or subdomain
 * Used for autocomplete/search in reassignment and other admin selection flows
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const role = searchParams.get('role') // Optional: filter by role
    const limit = parseInt(searchParams.get('limit') || '20')

    if (query.length < 2) {
      return NextResponse.json({ 
        admins: [],
        message: 'Enter at least 2 characters to search'
      })
    }

    // Build search conditions
    const searchConditions: any = {
      AND: [
        {
          status: 'Active' // Only active admins
        },
        {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { subdomain: { contains: query, mode: 'insensitive' } }
          ]
        }
      ]
    }

    // Add role filter if provided
    if (role) {
      searchConditions.AND.push({ role })
    }

    const admins = await prisma.admin.findMany({
      where: searchConditions,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        subdomain: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
            strategicPartners: {
              where: { status: 'Active' },
              select: { id: true }
            }
          }
        }
      },
      take: limit,
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    })

    // Format results with partner count
    const results = admins.map(admin => ({
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      fullName: `${admin.firstName} ${admin.lastName}`,
      email: admin.email,
      subdomain: admin.subdomain,
      role: admin.role,
      teamId: admin.team?.id,
      teamName: admin.team?.name,
      activePartnerCount: admin.team?.strategicPartners?.length || 0
    }))

    return NextResponse.json({
      admins: results,
      count: results.length
    })

  } catch (error: any) {
    console.error('Admin search error:', error)
    return NextResponse.json(
      { error: 'Failed to search admins', details: error.message },
      { status: 500 }
    )
  }
}
