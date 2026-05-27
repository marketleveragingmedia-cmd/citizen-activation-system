import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use the SAME Prisma client the app uses
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
    }
  }
})

async function createAccounts() {
  console.log('🚀 Creating accounts using production database...\n')

  try {
    // 1. Create MASTER_ADMIN
    console.log('Creating MASTER_ADMIN...')
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

    console.log('✅ MASTER_ADMIN created!')
    console.log('   Email:', masterAdmin.email)
    console.log('   Password:', masterPassword)
    console.log()

    // 2. Create team
    console.log('Creating team...')
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
    console.log('Creating YOUR MAIN_ADMIN...')
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

    console.log('✅ YOUR MAIN_ADMIN created!')
    console.log('   Email:', mainAdmin.email)
    console.log('   Password:', mainPassword)
    console.log('   Team:', team.name)
    console.log()

    console.log('✅ ACCOUNTS CREATED SUCCESSFULLY!\n')
    console.log('📋 LOGIN CREDENTIALS:')
    console.log('─────────────────────────────────────────')
    console.log('MASTER ADMIN:')
    console.log('  Email: mzsamantha01+master@gmail.com')
    console.log('  Password: MasterAdmin2026!')
    console.log()
    console.log('YOUR MAIN ADMIN:')
    console.log('  Email: mzsamantha01+main@gmail.com')
    console.log('  Password: MainAdmin2026!')
    console.log()
    console.log('DEMO ACCOUNT (unchanged):')
    console.log('  Email: mzsamantha01@gmail.com')
    console.log('  Password: ChangeMe123!')
    console.log('─────────────────────────────────────────')
    console.log()
    console.log('🔗 Login: https://hub.citizenactivation.com/login')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAccounts()
