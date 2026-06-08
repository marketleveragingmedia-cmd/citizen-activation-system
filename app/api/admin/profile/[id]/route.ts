import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET /api/admin/profile/[id] - View admin or partner profile
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentAdmin = await prisma.admin.findUnique({
      where: { id: session.user.id }
    })

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { id } = params

    // Try finding as Admin first
    let profile = await prisma.admin.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            createdBy: true
          }
        },
        teamsCreated: {
          include: {
            admins: true,
            strategicPartners: true
          }
        }
      }
    })

    if (profile) {
      // Verify access permissions
      const canView =
        currentAdmin.role === 'MASTER_ADMIN' ||
        currentAdmin.id === profile.id ||
        (currentAdmin.role === 'MAIN_ADMIN' && profile.team?.createdByAdminId === currentAdmin.id)

      if (!canView) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json({
        type: 'admin',
        profile: {
          id: profile.id,
          role: profile.role,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          subdomain: profile.subdomain,
          referralCode: profile.referralCode,
          status: profile.status,
          createdDate: profile.createdDate,
          isFounder: profile.isFounder,
          team: profile.team,
          createdBy: profile.team?.createdBy || null,
          teamsCreated: profile.teamsCreated || [],
          networkSize: {
            teamAdmins: profile.teamsCreated?.filter((t: any) => t.tierType === 'FullSystem').length || 0,
            orgAdmins: profile.teamsCreated?.filter((t: any) => t.tierType === 'SoloOrg').length || 0,
            partners: profile.teamsCreated?.reduce((sum: number, t: any) => sum + t.strategicPartners.length, 0) || 0
          }
        }
      })
    }

    // Try finding as Strategic Partner
    const partner = await prisma.strategicPartner.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            admins: true,
            createdBy: true
          }
        },
        assignedRequests: true
      }
    })

    if (partner) {
      // Verify access permissions
      const canView =
        currentAdmin.role === 'MASTER_ADMIN' ||
        (currentAdmin.teamId === partner.teamId) ||
        (currentAdmin.role === 'MAIN_ADMIN' && partner.team?.createdByAdminId === currentAdmin.id)

      if (!canView) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json({
        type: 'partner',
        profile: {
          id: partner.id,
          firstName: partner.firstName,
          lastName: partner.lastName,
          email: partner.email,
          phone: partner.phone,
          referralCode: partner.referralCode,
          activationLevel: partner.activationLevel,
          slotsUsed: partner.slotsUsed,
          slotsAvailable: partner.slotsAvailable,
          status: partner.status,
          createdDate: partner.createdDate,
          team: partner.team,
          teamAdmin: partner.team?.admins.find((a: any) => a.role === 'TEAM_ADMIN' || a.role === 'ORG_ADMIN'),
          createdBy: partner.team?.createdBy || null,
          totalAssigned: partner.assignedRequests.length,
          totalActivated: partner.assignedRequests.filter((r: any) => r.status === 'Activated').length
        }
      })
    }

    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  } catch (error: any) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
