const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createManualAccount() {
  // ========================================
  // CONFIGURATION - UPDATE THESE VALUES
  // ========================================
  
  const accountType = 'white_label' // OPTIONS: 'team_admin', 'org_admin', 'white_label'
  
  const customerInfo = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@example.com',
    phone: '+1234567890', // Optional
    password: 'TempPassword123!', // Send this securely to customer
  }
  
  const paymentInfo = {
    method: 'MOSCA_MARKETPLACE', // or 'CRYPTO_BTC', 'CRYPTO_ETH', 'WIRE_TRANSFER', etc.
    amount: 1997, // Amount in USD
    transactionId: 'MOSCA-TX-12345', // Reference/Transaction ID
    datePaid: new Date(),
  }
  
  // For team_admin only - specify existing team
  const existingTeamId = 'YOUR_MAIN_TEAM_ID' // Required for team_admin type

  // ========================================
  // DO NOT EDIT BELOW THIS LINE
  // ========================================

  try {
    console.log('🔐 Hashing password...')
    const passwordHash = await bcrypt.hash(customerInfo.password, 10)

    if (accountType === 'white_label') {
      console.log('🏢 Creating White-Label Main Admin...')
      
      const team = await prisma.team.create({
        data: {
          name: `${customerInfo.firstName}'s System`,
          tierType: 'WhiteLabel',
          status: 'Active',
          slotsAvailable: 999, // Unlimited for white-label
          createdDate: new Date(),
        }
      })

      const admin = await prisma.admin.create({
        data: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          passwordHash: passwordHash,
          role: 'MAIN_ADMIN',
          status: 'Active',
          teamId: team.id,
          notes: `Manual payment: ${paymentInfo.method} - ${paymentInfo.transactionId} - $${paymentInfo.amount} on ${paymentInfo.datePaid.toISOString()}`,
        }
      })

      console.log('\n✅ WHITE-LABEL ACCOUNT CREATED!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('Team ID:', team.id)
      console.log('Team Name:', team.name)
      console.log('Admin ID:', admin.id)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔗 Login URL: https://hub.citizenactivation.com/login')
      console.log('📧 Email:', customerInfo.email)
      console.log('🔑 Temporary Password:', customerInfo.password)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n⚠️  IMPORTANT NEXT STEPS:')
      console.log('1. Send credentials to customer via SECURE channel')
      console.log('2. Log payment in tracking spreadsheet')
      console.log('3. Set renewal reminder for:', new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0])
      console.log('4. Send welcome email with getting started guide')
    }

    if (accountType === 'org_admin') {
      console.log('🏢 Creating Organization Admin...')
      
      const team = await prisma.team.create({
        data: {
          name: `${customerInfo.firstName}'s Organization`,
          tierType: 'OrganizationLevel',
          status: 'Active',
          slotsAvailable: 50,
          createdDate: new Date(),
        }
      })

      const admin = await prisma.admin.create({
        data: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          passwordHash: passwordHash,
          role: 'TEAM_ADMIN',
          status: 'Active',
          teamId: team.id,
          notes: `Manual payment: ${paymentInfo.method} - ${paymentInfo.transactionId} - $${paymentInfo.amount} on ${paymentInfo.datePaid.toISOString()}`,
        }
      })

      console.log('\n✅ ORGANIZATION ADMIN CREATED!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('Team ID:', team.id)
      console.log('Team Name:', team.name)
      console.log('Admin ID:', admin.id)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔗 Login URL: https://hub.citizenactivation.com/login')
      console.log('📧 Email:', customerInfo.email)
      console.log('🔑 Temporary Password:', customerInfo.password)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n⚠️  IMPORTANT NEXT STEPS:')
      console.log('1. Send credentials securely')
      console.log('2. Log payment in tracking sheet')
      console.log('3. Set renewal reminder')
    }

    if (accountType === 'team_admin') {
      console.log('👤 Creating Team Admin...')

      if (!existingTeamId || existingTeamId === 'YOUR_MAIN_TEAM_ID') {
        throw new Error('❌ ERROR: existingTeamId must be set for team_admin type!')
      }

      const admin = await prisma.admin.create({
        data: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          passwordHash: passwordHash,
          role: 'TEAM_ADMIN',
          status: 'Active',
          teamId: existingTeamId,
          notes: `Manual payment: ${paymentInfo.method} - ${paymentInfo.transactionId} - $${paymentInfo.amount} on ${paymentInfo.datePaid.toISOString()}`,
        }
      })

      console.log('\n✅ TEAM ADMIN CREATED!')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('Admin ID:', admin.id)
      console.log('Team ID:', existingTeamId)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔗 Login URL: https://hub.citizenactivation.com/login')
      console.log('📧 Email:', customerInfo.email)
      console.log('🔑 Temporary Password:', customerInfo.password)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('\n⚠️  IMPORTANT NEXT STEPS:')
      console.log('1. Send credentials securely')
      console.log('2. Log payment in tracking sheet')
      console.log('3. Set renewal reminder')
    }

  } catch (error) {
    console.error('\n❌ ERROR CREATING ACCOUNT:')
    console.error(error.message)
    console.error('\nFull error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createManualAccount()
