import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })

async function reset() {
  const newPassword = 'TempPass123!'
  const hash = await bcrypt.hash(newPassword, 10)
  
  const partner = await prisma.strategicPartner.update({
    where: { email: 'drifllc.marketing+345@gmail.com' },
    data: { passwordHash: hash }
  })
  
  console.log('✅ Password reset for:', partner.email)
  console.log('New temp password:', newPassword)
  console.log('Please login and change it immediately!')
}

reset().catch(console.error).finally(() => prisma.$disconnect())
