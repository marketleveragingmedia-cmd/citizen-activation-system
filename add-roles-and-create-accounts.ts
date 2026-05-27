import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
})

async function run() {
  console.log('🚀 Adding new roles and creating accounts...\n')

  try {
    // Step 1: Add new roles to the enum
    console.log('Step 1: Adding MASTER_ADMIN role to database...')
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MASTER_ADMIN'`)
    console.log('Step 2: Adding ORG_ADMIN role to database...')
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ORG_ADMIN'`)
    console.log('✅ Roles added to database\n')

    // Step 2: Create MASTER_ADMIN
    console.log('Step 2: Creating MASTER_ADMIN account...')
    const masterPassword = 'MasterAdmin2026!'
    const hashedMasterPassword = await bcrypt.hash(masterPassword, 10)

    const masterAdmin = await prisma.admin.upsert({
      where: { email: 'mzsamantha01+master@gmail.com' },
      update: {},
      create: {
        role: 'MASTER_ADMIN' as any,
        firstName: 'Samantha',
        lastName: 'Master',
        email: 'mzsamantha01+master@gmail.com',
        passwordHash: hashedMasterPassword,
        status: 'Active',
        teamId: null
      }
    })
    console.log('✅ MASTER_ADMIN created\n')

    // Step 3: Create team
    console.log('Step 3: Creating team for MAIN_ADMIN...')
    const team = await prisma.team.create({
      data: {
        name: "Samantha's Business Network",
        adminId: 'temp',
        tierType: 'FullSystem',
        autoAssignEnabled: true,
        status: 'Active'
      }
    })
    console.log('✅ Team created\n')

    // Step 4: Create MAIN_ADMIN
    console.log('Step 4: Creating YOUR MAIN_ADMIN account...')
    const mainPassword = 'MainAdmin2026!'
    const hashedMainPassword = await bcrypt.hash(mainPassword, 10)

    const mainAdmin = await prisma.admin.upsert({
      where: { email: 'mzsamantha01+main@gmail.com' },
      update: {},
      create: {
        role: 'MAIN_ADMIN' as any,
        firstName: 'Samantha',
        lastName: 'Main',
        email: 'mzsamantha01+main@gmail.com',
        passwordHash: hashedMainPassword,
        status: 'Active',
        teamId: team.id
      }
    })

    // Step 5: Update team
    await prisma.team.update({
      where: { id: team.id },
      data: { adminId: mainAdmin.id }
    })
    console.log('✅ YOUR MAIN_ADMIN created\n')

    console.log('✅✅✅ SUCCESS! ALL ACCOUNTS CREATED! ✅✅✅\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 LOGIN CREDENTIALS:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log()
    console.log('🔐 MASTER ADMIN (System Oversight):')
    console.log('   Email: mzsamantha01+master@gmail.com')
    console.log('   Password: MasterAdmin2026!')
    console.log('   Role: MASTER_ADMIN')
    console.log('   Dashboard: Sees ALL networks')
    console.log()
    console.log('🔐 YOUR MAIN ADMIN (Business Network):')
    console.log('   Email: mzsamantha01+main@gmail.com')
    console.log('   Password: MainAdmin2026!')
    console.log('   Role: MAIN_ADMIN')
    console.log('   Dashboard: Sees only YOUR network')
    console.log()
    console.log('🔐 DEMO ACCOUNT (Unchanged):')
    console.log('   Email: mzsamantha01@gmail.com')
    console.log('   Password: ChangeMe123!')
    console.log('   Role: MAIN_ADMIN')
    console.log('   Dashboard: Full features for demos')
    console.log()
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔗 Login: https://hub.citizenactivation.com/login')
    console.log('⚠️  CHANGE ALL PASSWORDS AFTER FIRST LOGIN')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

run()
