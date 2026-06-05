import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

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
      subdomain,
      organizationName,
      referralCode
    } = body

    // Validate required fields
    if (!accountType || !email || !firstName || !lastName || !phone || !subdomain || !referralCode) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields (email, name, phone, subdomain, Referral Code)' 
      }, { status: 400 })
    }

    // Validate subdomain format and availability
    const cleanSubdomain = subdomain.toLowerCase().trim()
    const validFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/
    
    if (!validFormat.test(cleanSubdomain) || cleanSubdomain.length < 3 || cleanSubdomain.length > 20) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid subdomain format (3-20 chars, letters, numbers, hyphens only)' 
      }, { status: 400 })
    }

    // Check if subdomain already taken
    const existingSubdomain = await prisma.admin.findFirst({
      where: {
        subdomain: {
          equals: cleanSubdomain,
          mode: 'insensitive'
        }
      }
    })

    if (existingSubdomain) {
      return NextResponse.json({ 
        success: false, 
        error: 'Subdomain already taken' 
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
            status: 'Active',
            createdByAdminId: session.user.id // Track Master Admin creator
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
            subdomain: cleanSubdomain,
            passwordHash: hashedPassword,
            referralCode: referralCode,
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
        // Create team for Team Admin
        const team = await prisma.team.create({
          data: {
            name: organizationName || `${firstName} ${lastName}'s Team`,
            adminId: 'temp',
            tierType: 'FullSystem',
            autoAssignEnabled: true,
            status: 'Active',
            createdByAdminId: session.user.id // Track Master Admin creator
          }
        })

        teamId = team.id

        // Create TEAM_ADMIN with team
        newAdmin = await prisma.admin.create({
          data: {
            role: 'TEAM_ADMIN',
            firstName,
            lastName,
            email,
            phone,
            subdomain: cleanSubdomain,
            passwordHash: hashedPassword,
            referralCode: referralCode,
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

      case 'ORG_ADMIN': {
        // Create organization team first
        const orgTeam = await prisma.team.create({
          data: {
            name: organizationName || `${firstName} ${lastName}'s Organization`,
            adminId: 'temp',
            tierType: 'SoloOrg',
            autoAssignEnabled: true,
            status: 'Active',
            createdByAdminId: session.user.id // Track Master Admin creator
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
            subdomain: cleanSubdomain,
            passwordHash: hashedPassword,
            referralCode: referralCode,
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

      case 'FOUNDER': {
        // Create team for Founder
        const team = await prisma.team.create({
          data: {
            name: organizationName || `${firstName} ${lastName} - Founder Network`,
            adminId: 'temp',
            tierType: 'FullSystem',
            autoAssignEnabled: true,
            status: 'Active',
            createdByAdminId: session.user.id // Track Master Admin creator
          }
        })

        teamId = team.id

        // Create FOUNDER (MAIN_ADMIN + isFounder flags)
        newAdmin = await prisma.admin.create({
          data: {
            role: 'MAIN_ADMIN',
            firstName,
            lastName,
            email,
            phone,
            subdomain: cleanSubdomain,
            passwordHash: hashedPassword,
            referralCode: referralCode,
            moscaCode: referralCode, // Save MOSCA code
            status: 'Active',
            teamId: team.id,
            isFounder: true,
            founderDate: new Date(),
            founderPaymentMethod: 'Manual',
            founderPaymentDetails: `Created by Master Admin (${session.user.email}) - No payment required`,
          }
        })

        // Update team adminId
        await prisma.team.update({
          where: { id: team.id },
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

    // Automatically register subdomain with Vercel for immediate SSL
    try {
      await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${cleanSubdomain}.citizenactivation.com`
        })
      })
      console.log(`Registered subdomain: ${cleanSubdomain}.citizenactivation.com`)
    } catch (err) {
      console.error('Failed to register subdomain with Vercel:', err)
      // Don't fail account creation if Vercel registration fails
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
        subdomain: cleanSubdomain,
        subdomainUrl: `https://${cleanSubdomain}.citizenactivation.com`,
        teamId
      },
      credentials: {
        email: newAdmin.email,
        temporaryPassword: tempPassword,
        loginUrl: `https://${cleanSubdomain}.citizenactivation.com/login`,
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
