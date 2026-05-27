import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
})

async function check() {
  console.log('📊 DATABASE CONTENTS:\n')
  
  const admins = await prisma.admin.findMany({ select: { email: true, role: true, teamId: true } })
  console.log('ADMINS:', admins)
  
  const teams = await prisma.team.findMany({ select: { id: true, name: true, tierType: true, status: true } })
  console.log('\nTEAMS:', teams)
  
  const partners = await prisma.strategicPartner.findMany({ select: { id: true, firstName: true, lastName: true, status: true } })
  console.log('\nSTRATEGIC PARTNERS:', partners)
  
  await prisma.$disconnect()
}

check()
