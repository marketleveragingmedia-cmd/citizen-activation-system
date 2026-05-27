import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createYourMainAdmin() {
  console.log('Creating YOUR MAIN_ADMIN account...\n')

  const password = 'MainAdmin2026!' // Temporary password
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Check if already exists
    const existing = await prisma.admin.findUnique({
      where: { email: 'mzsamantha01+main@gmail.com' }
    })

    if (existing) {
      console.log('⚠️  MAIN_ADMIN already exists!')
      console.log('Email:', existing.email)
      return
    }

    // Create team first
    const team = await prisma.team.create({
      data: {
        name: "Samantha's Business Network",
        adminId: 'temp', // Will update after creating admin
        tierType: 'FullSystem',
        autoAssignEnabled: true,
        status: 'Active'
      }
    })

    // Create Main Admin
    const mainAdmin = await prisma.admin.create({
      data: {
        role: 'MAIN_ADMIN',
        firstName: 'Samantha',
        lastName: 'Main',
        email: 'mzsamantha01+main@gmail.com',
        passwordHash: hashedPassword,
        status: 'Active',
        teamId: team.id
      }
    })

    // Update team adminId
    await prisma.team.update({
      where: { id: team.id },
      data: { adminId: mainAdmin.id }
    })

    console.log('✅ YOUR MAIN_ADMIN created successfully!\n')
    console.log('📧 Email:', mainAdmin.email)
    console.log('🔑 Password:', password)
    console.log('👥 Team:', "Samantha's Business Network")
    console.log('🔗 Login:', process.env.NEXTAUTH_URL + '/login')
    console.log('\n⚠️  CHANGE PASSWORD AFTER FIRST LOGIN\n')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createYourMainAdmin()
