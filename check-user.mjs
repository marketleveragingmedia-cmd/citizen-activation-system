import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'drifllc.marketing+345@gmail.com' },
    include: { strategicPartner: true }
  })
  
  if (!user) {
    console.log('❌ User NOT FOUND')
  } else {
    console.log('✅ User found:')
    console.log('Email:', user.email)
    console.log('Role:', user.role)
    console.log('Has Password:', !!user.password)
    if (user.strategicPartner) {
      console.log('Partner Name:', user.strategicPartner.firstName, user.strategicPartner.lastName)
      console.log('Partner Status:', user.strategicPartner.status)
    } else {
      console.log('❌ NO Strategic Partner record')
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
