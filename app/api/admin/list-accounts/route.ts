import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

export async function POST(req: Request) {
  try {
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

    // 2. Create team
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

    // 4. Update team
    await prisma.team.update({
      where: { id: team.id },
      data: { adminId: mainAdmin.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Accounts created successfully!',
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
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
