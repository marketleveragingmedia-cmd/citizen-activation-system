const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkPartner() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'drifllc.marketing+345@gmail.com' },
      include: {
        strategicPartner: true
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('✅ User found:')
    console.log('- Email:', user.email)
    console.log('- Role:', user.role)
    console.log('- Has password:', !!user.password)
    console.log('- Strategic Partner:', user.strategicPartner ? 'YES' : 'NO')
    
    if (user.strategicPartner) {
      console.log('\nStrategic Partner Details:')
      console.log('- Name:', user.strategicPartner.firstName, user.strategicPartner.lastName)
      console.log('- Status:', user.strategicPartner.status)
      console.log('- Referral Code:', user.strategicPartner.referralCode)
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkPartner()
