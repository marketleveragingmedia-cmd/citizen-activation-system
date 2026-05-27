import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// This endpoint creates the MASTER_ADMIN and MAIN_ADMIN accounts
// No authentication required - this is a one-time bootstrap
export async function POST() {
  try {
    const results = []

    // 1. Create MASTER_ADMIN
    const masterPassword = 'MasterAdmin2026!'
    const hashedMasterPassword = await bcrypt.hash(masterPassword, 10)

    const masterAdmin = await prisma.admin.upsert({
      where: { email: 'mzsamantha01+master@gmail.com' },
      update: {},
      create: {
        role: 'MASTER_ADMIN',
        firstName: 'Samantha',
        lastName: 'Master',
        email: 'mzsamantha01+master@gmail.com',
        passwordHash: hashedMasterPassword,
        status: 'Active',
        teamId: null
      }
    })

    results.push({
      account: 'MASTER_ADMIN',
      email: masterAdmin.email,
      password: masterPassword,
      status: 'created'
    })

    // 2. Create team for MAIN_ADMIN
    const team = await prisma.team.create({
      data: {
        name: "Samantha's Business Network",
        adminId: 'temp',
        tierType: 'FullSystem',
        autoAssignEnabled: true,
        status: 'Active'
      }
    })

    // 3. Create MAIN_ADMIN
    const mainPassword = 'MainAdmin2026!'
    const hashedMainPassword = await bcrypt.hash(mainPassword, 10)

    const mainAdmin = await prisma.admin.upsert({
      where: { email: 'mzsamantha01+main@gmail.com' },
      update: {},
      create: {
        role: 'MAIN_ADMIN',
        firstName: 'Samantha',
        lastName: 'Main',
        email: 'mzsamantha01+main@gmail.com',
        passwordHash: hashedMainPassword,
        status: 'Active',
        teamId: team.id
      }
    })

    // 4. Update team with correct adminId
    await prisma.team.update({
      where: { id: team.id },
      data: { adminId: mainAdmin.id }
    })

    results.push({
      account: 'MAIN_ADMIN',
      email: mainAdmin.email,
      password: mainPassword,
      teamId: team.id,
      teamName: team.name,
      status: 'created'
    })

    return NextResponse.json({
      success: true,
      message: 'Accounts created successfully',
      results,
      credentials: {
        masterAdmin: {
          email: 'mzsamantha01+master@gmail.com',
          password: 'MasterAdmin2026!',
          role: 'MASTER_ADMIN'
        },
        mainAdmin: {
          email: 'mzsamantha01+main@gmail.com',
          password: 'MainAdmin2026!',
          role: 'MAIN_ADMIN'
        },
        demo: {
          email: 'mzsamantha01@gmail.com',
          password: 'ChangeMe123!',
          role: 'MAIN_ADMIN'
        }
      },
      loginUrl: 'https://hub.citizenactivation.com/login'
    })

  } catch (error: any) {
    console.error('Bootstrap error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}
