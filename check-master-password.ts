import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
  
  if (!master) {
    console.log('❌ Account does not exist')
    return
  }
  
  console.log('✅ Account exists')
  console.log('Email:', master.email)
  console.log('Role:', master.role)
  console.log('Status:', master.status)
  
  // Test password
  const testPassword = 'MasterAdmin2026!'
  const matches = await bcrypt.compare(testPassword, master.passwordHash)
  
  console.log('\nPassword test:')
  console.log('Testing password: MasterAdmin2026!')
  console.log('Result:', matches ? '✅ CORRECT' : '❌ WRONG')
  
  if (!matches) {
    console.log('\n🔄 Generating new password hash...')
    const newHash = await bcrypt.hash(testPassword, 10)
    console.log('New hash:', newHash.substring(0, 20) + '...')
    
    await prisma.admin.update({
      where: { email: 'mzsamantha01+master@gmail.com' },
      data: { passwordHash: newHash }
    })
    
    console.log('✅ Password reset complete')
    console.log('Email: mzsamantha01+master@gmail.com')
    console.log('Password: MasterAdmin2026!')
  }
  
  await prisma.$disconnect()
}

check()
