import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const results = {
      masterAdmin: null as any,
      mainAdmin: null as any,
      errors: [] as string[]
    }

    // 1. Create MASTER_ADMIN
    try {
      const existingMaster = await prisma.admin.findUnique({
        where: { email: 'mzsamantha01+master@gmail.com' }
      })

      if (existingMaster) {
        results.errors.push('MASTER_ADMIN already exists')
        results.masterAdmin = { exists: true, email: existingMaster.email }
      } else {
        const masterPassword = 'MasterAdmin2026!'
        const hashedMasterPassword = await bcrypt.hash(masterPassword, 10)

        const masterAdmin = await prisma.admin.create({
          data: {
            role: 'MASTER_ADMIN',
            firstName: 'Samantha',
            lastName: 'Master',
            email: 'mzsamantha01+master@gmail.com',
            passwordHash: hashedMasterPassword,
            status: 'Active',
            teamId: null
          }
        })

        results.masterAdmin = {
          created: true,
          id: masterAdmin.id,
          email: masterAdmin.email,
          password: masterPassword,
          role: masterAdmin.role
        }
      }
    } catch (error: any) {
      results.errors.push(`Master Admin error: ${error.message}`)
    }

    // 2. Create YOUR MAIN_ADMIN
    try {
      const existingMain = await prisma.admin.findUnique({
        where: { email: 'mzsamantha01+main@gmail.com' }
      })

      if (existingMain) {
        results.errors.push('MAIN_ADMIN already exists')
        results.mainAdmin = { exists: true, email: existingMain.email }
      } else {
        const mainPassword = 'MainAdmin2026!'
        const hashedMainPassword = await bcrypt.hash(mainPassword, 10)

        // Create team
        const team = await prisma.team.create({
          data: {
            name: "Samantha's Business Network",
            adminId: 'temp',
            tierType: 'FullSystem',
            autoAssignEnabled: true,
            status: 'Active'
          }
        })

        // Create admin
        const mainAdmin = await prisma.admin.create({
          data: {
            role: 'MAIN_ADMIN',
            firstName: 'Samantha',
            lastName: 'Main',
            email: 'mzsamantha01+main@gmail.com',
            passwordHash: hashedMainPassword,
            status: 'Active',
            teamId: team.id
          }
        })

        // Update team
        await prisma.team.update({
          where: { id: team.id },
          data: { adminId: mainAdmin.id }
        })

        results.mainAdmin = {
          created: true,
          id: mainAdmin.id,
          email: mainAdmin.email,
          password: mainPassword,
          role: mainAdmin.role,
          teamId: team.id,
          teamName: team.name
        }
      }
    } catch (error: any) {
      results.errors.push(`Main Admin error: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Account creation completed',
      results,
      loginUrl: 'https://hub.citizenactivation.com/login',
      credentials: {
        masterAdmin: {
          email: 'mzsamantha01+master@gmail.com',
          password: 'MasterAdmin2026!'
        },
        mainAdmin: {
          email: 'mzsamantha01+main@gmail.com',
          password: 'MainAdmin2026!'
        },
        demo: {
          email: 'mzsamantha01@gmail.com',
          password: 'ChangeMe123!'
        }
      }
    })

  } catch (error: any) {
    console.error('Account creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
