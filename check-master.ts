import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
})

async function check() {
  const master = await prisma.admin.findUnique({
    where: { email: 'mzsamantha01+master@gmail.com' }
  })
  
  console.log('Master Admin Account:')
  console.log('Email:', master?.email)
  console.log('Role:', master?.role)
  console.log('ID:', master?.id)
  
  await prisma.$disconnect()
}

check()
