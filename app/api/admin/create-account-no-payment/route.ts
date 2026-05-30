import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Master Admin - Create Account Without Payment
 * POST /api/admin/create-account-no-payment
 */
export async function POST(req: Request) {
  try {
    // Verify Master Admin session
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Master Admin only' 
      }, { status: 403 })
    }

    const body = await req.json()
    const { 
      accountType, 
      email, 
      firstName, 
      lastName, 
      phone, 
      organizationName 
    } = body

    // Validate required fields
    if (!accountType || !email || !firstName || !lastName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email already exists in system' 
      }, { status: 400 })
    }

    // Generate temporary password
    const tempPassword = `Welcome${Math.random().toString(36).slice(-8)}!`
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    let newAdmin
    let teamId = null

    // Create account based on type
    switch (accountType) {
      case 'MAIN_ADMIN': {
        // Create team first
        const team = await prisma.team.create({
          data: {
            name: organizationName || `${firstName} ${lastName}'s Network`,
            adminId: 'temp',
            tierType: 'FullSystem',
            autoAssignEnabled: true,
            status: 'Active'
          }
        })

        teamId = team.id

        // Create MAIN_ADMIN
        newAdmin = await prisma.admin.create({
          data: {
            role: 'MAIN_ADMIN',
            firstName,
            lastName,
            email,
            phone,
            passwordHash: hashedPassword,
            status: 'Active',
            teamId: team.id
          }
        })

        // Update team adminId
        await prisma.team.update({
          where: { id: team.id },
          data: { adminId: newAdmin.id }
        })
        break
      }

      case 'TEAM_ADMIN': {
        // Team Admin (direct, no team)
        newAdmin = await prisma.admin.create({
          data: {
            role: 'TEAM_ADMIN',
            firstName,
            lastName,
            email,
            phone,
            passwordHash: hashedPassword,
            status: 'Active'
          }
        })
        break
      }

      case 'ORG_ADMIN': {
        // Create organization team first
        const orgTeam = await prisma.team.create({
          data: {
            name: organizationName || `${firstName} ${lastName}'s Organization`,
            adminId: 'temp',
            tierType: 'SoloOrg',
            autoAssignEnabled: true,
            status: 'Active'
          }
        })

        teamId = orgTeam.id

        // Create ORG_ADMIN
        newAdmin = await prisma.admin.create({
          data: {
            role: 'ORG_ADMIN',
            firstName,
            lastName,
            email,
            phone,
            passwordHash: hashedPassword,
            status: 'Active',
            teamId: orgTeam.id
          }
        })

        // Update team adminId
        await prisma.team.update({
          where: { id: orgTeam.id },
          data: { adminId: newAdmin.id }
        })
        break
      }

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid account type' 
        }, { status: 400 })
    }

    // TODO: Send welcome email with credentials
    // For now, return credentials in response

    return NextResponse.json({
      success: true,
      message: `${accountType} account created successfully`,
      account: {
        id: newAdmin.id,
        role: newAdmin.role,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        teamId
      },
      credentials: {
        email: newAdmin.email,
        temporaryPassword: tempPassword,
        loginUrl: 'https://hub.citizenactivation.com/login',
        instructions: 'User must change password on first login'
      }
    })

  } catch (error: any) {
    console.error('Create account error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
