import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
})

async function reset() {
  const newPassword = 'Master2026!'
  const hash = await bcrypt.hash(newPassword, 10)
  
  await prisma.admin.update({
    where: { email: 'mzsamantha01+master@gmail.com' },
    data: { passwordHash: hash }
  })
  
  console.log('✅ Password reset complete')
  console.log('Email: mzsamantha01+master@gmail.com')
  console.log('New Password: Master2026!')
  
  await prisma.$disconnect()
}

reset()
