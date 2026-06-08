import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/network - Get current admin's network (Main Admin use)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      include: { team: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Get network based on role
    let network: any = {}

    if (admin.role === 'MASTER_ADMIN') {
      // Master Admin sees EVERYTHING
      const [mainAdmins, teamAdmins, orgAdmins, partners] = await Promise.all([
        prisma.admin.findMany({
          where: { role: 'MAIN_ADMIN' },
          include: {
            team: true,
            teamsCreated: {
              include: {
                admins: true,
                strategicPartners: true
              }
            }
          },
          orderBy: { createdDate: 'desc' }
        }),
        prisma.admin.findMany({
          where: { role: 'TEAM_ADMIN' },
          include: {
            team: {
              include: {
                strategicPartners: true,
                createdBy: true
              }
            }
          },
          orderBy: { createdDate: 'desc' }
        }),
        prisma.admin.findMany({
          where: { role: 'ORG_ADMIN' },
          include: {
            team: {
              include: {
                strategicPartners: true,
                createdBy: true
              }
            }
          },
          orderBy: { createdDate: 'desc' }
        }),
        prisma.strategicPartner.findMany({
          include: {
            team: {
              include: {
                createdBy: true,
                admins: true
              }
            }
          },
          orderBy: { createdDate: 'desc' }
        })
      ])

      network = {
        mainAdmins,
        teamAdmins,
        orgAdmins,
        partners,
        totalMainAdmins: mainAdmins.length,
        totalTeamAdmins: teamAdmins.length,
        totalOrgAdmins: orgAdmins.length,
        totalPartners: partners.length
      }
    } else if (admin.role === 'MAIN_ADMIN') {
      // Main Admin sees their created Team/Org Admins
      const createdTeams = await prisma.team.findMany({
        where: { createdByAdminId: admin.id },
        include: {
          admins: true,
          strategicPartners: true
        },
        orderBy: { createdDate: 'desc' }
      })

      const teamAdmins = createdTeams.filter(t => t.tierType === 'FullSystem')
      const orgAdmins = createdTeams.filter(t => t.tierType === 'SoloOrg')

      network = {
        createdTeams,
        teamAdmins,
        orgAdmins,
        totalTeamAdmins: teamAdmins.length,
        totalOrgAdmins: orgAdmins.length,
        totalPartners: createdTeams.reduce((sum, t) => sum + t.strategicPartners.length, 0)
      }
    } else if (admin.role === 'TEAM_ADMIN' || admin.role === 'ORG_ADMIN') {
      // Team/Org Admin sees their Strategic Partners and who created them
      const team = await prisma.team.findUnique({
        where: { id: admin.teamId! },
        include: {
          strategicPartners: true,
          createdBy: true
        }
      })

      network = {
        team,
        partners: team?.strategicPartners || [],
        createdBy: team?.createdBy || null,
        totalPartners: team?.strategicPartners.length || 0
      }
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email
      },
      network
    })
  } catch (error: any) {
    console.error('Network API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
