const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMasterAdmin() {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: 'mzsamantha01+master@gmail.com' }
    })
    
    if (admin) {
      console.log('✅ Master Admin account found:')
      console.log('ID:', admin.id)
      console.log('Email:', admin.email)
      console.log('Role:', admin.role)
      console.log('Status:', admin.status)
      console.log('Name:', admin.firstName, admin.lastName)
    } else {
      console.log('❌ No account found with that email')
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkMasterAdmin()
