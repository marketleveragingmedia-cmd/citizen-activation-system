import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Main Admin (Samantha)
  const hashedPassword = await bcrypt.hash('ChangeMe123!', 10)
  
  const mainAdmin = await prisma.admin.create({
    data: {
      role: 'MAIN_ADMIN',
      firstName: 'Samantha',
      lastName: 'MzSamantha',
      email: 'mzsamantha01@gmail.com',
      passwordHash: hashedPassword,
      status: 'Active'
    }
  })

  console.log('✅ Main Admin created:', mainAdmin.email)

  // Create default team
  const team = await prisma.team.create({
    data: {
      name: 'Main Team',
      adminId: mainAdmin.id,
      autoAssignEnabled: true,
      status: 'Active'
    }
  })

  console.log('✅ Team created:', team.name)

  // Create sample Strategic Partner (for testing)
  const samplePartner = await prisma.strategicPartner.create({
    data: {
      teamId: team.id,
      firstName: 'Test',
      lastName: 'Partner',
      email: 'test.partner@example.com',
      passwordHash: hashedPassword,
      phone: '+1234567890',
      referralCode: 'MOSCA-TEST-001',
      slotsUsed: 0,
      slotsAvailable: 3,
      status: 'Active',
      activationLevel: 'Citizen',
      activationDate: new Date()
    }
  })

  console.log('✅ Sample Strategic Partner created:', samplePartner.email)
  console.log('   Referral Code:', samplePartner.referralCode)

  console.log('\n📋 Login Credentials:')
  console.log('   Main Admin: marketleveragingmedia@agentmail.to')
  console.log('   Test Partner: test.partner@example.com')
  console.log('   Password: ChangeMe123!')
  console.log('   Test Referral Code: MOSCA-TEST-001')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
