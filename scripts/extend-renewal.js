const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function extendRenewal() {
  // ========================================
  // CONFIGURATION - UPDATE THESE VALUES
  // ========================================
  
  const adminEmail = 'customer@example.com'
  
  const paymentInfo = {
    method: 'MOSCA_MARKETPLACE', // or 'CRYPTO_BTC', 'WIRE_TRANSFER', etc.
    amount: 997, // Renewal amount paid
    transactionId: 'MOSCA-TX-67890',
    datePaid: new Date(),
  }

  // ========================================
  // DO NOT EDIT BELOW THIS LINE
  // ========================================

  try {
    console.log('🔍 Looking up admin account...')
    
    const admin = await prisma.admin.findUnique({
      where: { email: adminEmail },
      include: { team: true }
    })

    if (!admin) {
      throw new Error(`❌ Admin not found with email: ${adminEmail}`)
    }

    console.log('✅ Admin found:', admin.firstName, admin.lastName)
    console.log('Current status:', admin.status)

    // Calculate new renewal date (1 year from now)
    const renewalDate = new Date()
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)

    // Update admin status and add payment note
    const existingNotes = admin.notes || ''
    const newNote = `\nRenewal paid ${paymentInfo.method} - ${paymentInfo.transactionId} - $${paymentInfo.amount} on ${paymentInfo.datePaid.toISOString()} - Next renewal: ${renewalDate.toISOString()}`

    const updatedAdmin = await prisma.admin.update({
      where: { email: adminEmail },
      data: {
        status: 'Active', // Reactivate if was suspended
        notes: existingNotes + newNote,
      }
    })

    console.log('\n✅ RENEWAL PROCESSED SUCCESSFULLY!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Admin:', updatedAdmin.firstName, updatedAdmin.lastName)
    console.log('Email:', updatedAdmin.email)
    console.log('Status:', updatedAdmin.status)
    console.log('Payment Method:', paymentInfo.method)
    console.log('Amount Paid:', `$${paymentInfo.amount}`)
    console.log('Payment Date:', paymentInfo.datePaid.toISOString().split('T')[0])
    console.log('Next Renewal Date:', renewalDate.toISOString().split('T')[0])
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  IMPORTANT NEXT STEPS:')
    console.log('1. Send renewal confirmation email to customer')
    console.log('2. Update payment tracking spreadsheet')
    console.log('3. Set calendar reminder for next renewal:', renewalDate.toISOString().split('T')[0])
    console.log('4. Mark invoice as paid')

  } catch (error) {
    console.error('\n❌ ERROR PROCESSING RENEWAL:')
    console.error(error.message)
    console.error('\nFull error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
extendRenewal()
