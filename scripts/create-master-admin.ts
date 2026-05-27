import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createMasterAdmin() {
  console.log('Creating MASTER_ADMIN account...\n')

  const password = 'MasterAdmin2026!' // Temporary password
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Check if already exists
    const existing = await prisma.admin.findUnique({
      where: { email: 'mzsamantha01+master@gmail.com' }
    })

    if (existing) {
      console.log('⚠️  MASTER_ADMIN already exists!')
      console.log('Email:', existing.email)
      return
    }

    // Create Master Admin
    const masterAdmin = await prisma.admin.create({
      data: {
        role: 'MASTER_ADMIN',
        firstName: 'Samantha',
        lastName: 'Master',
        email: 'mzsamantha01+master@gmail.com',
        passwordHash: hashedPassword,
        status: 'Active',
        teamId: null // Master Admin doesn't need a team
      }
    })

    console.log('✅ MASTER_ADMIN created successfully!\n')
    console.log('📧 Email:', masterAdmin.email)
    console.log('🔑 Password:', password)
    console.log('🔗 Login:', process.env.NEXTAUTH_URL + '/login')
    console.log('\n⚠️  CHANGE PASSWORD AFTER FIRST LOGIN\n')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createMasterAdmin()
