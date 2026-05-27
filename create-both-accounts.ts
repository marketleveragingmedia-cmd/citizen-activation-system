import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createBothAccounts() {
  console.log('🚀 Creating both accounts...\n')

  try {
    // 1. Create MASTER_ADMIN
    console.log('Creating MASTER_ADMIN...')
    const existingMaster = await prisma.admin.findUnique({
      where: { email: 'mzsamantha01+master@gmail.com' }
    })

    if (existingMaster) {
      console.log('⚠️  MASTER_ADMIN already exists\n')
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

      console.log('✅ MASTER_ADMIN created!')
      console.log('   Email:', masterAdmin.email)
      console.log('   Password:', masterPassword)
      console.log('   Role:', masterAdmin.role)
      console.log()
    }

    // 2. Create YOUR MAIN_ADMIN
    console.log('Creating YOUR MAIN_ADMIN...')
    const existingMain = await prisma.admin.findUnique({
      where: { email: 'mzsamantha01+main@gmail.com' }
    })

    if (existingMain) {
      console.log('⚠️  MAIN_ADMIN already exists\n')
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

      console.log('✅ YOUR MAIN_ADMIN created!')
      console.log('   Email:', mainAdmin.email)
      console.log('   Password:', mainPassword)
      console.log('   Role:', mainAdmin.role)
      console.log('   Team:', team.name)
      console.log()
    }

    console.log('✅ ACCOUNT CREATION COMPLETE!\n')
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
    console.log('🔗 Login at: https://hub.citizenactivation.com/login')
    console.log('⚠️  CHANGE ALL PASSWORDS AFTER FIRST LOGIN')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

createBothAccounts()
