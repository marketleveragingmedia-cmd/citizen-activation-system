import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
})

async function testLogin(email: string, password: string) {
  console.log(`\n🔐 Testing login for: ${email}`)
  console.log(`Password: ${password}`)
  
  const admin = await prisma.admin.findUnique({
    where: { email }
  })

  if (!admin) {
    console.log('❌ Account not found')
    return false
  }
  
  console.log(`✅ Account found`)
  console.log(`   Role: ${admin.role}`)
  console.log(`   Status: ${admin.status}`)
  console.log(`   Name: ${admin.firstName} ${admin.lastName}`)
  
  const isValid = await bcrypt.compare(password, admin.passwordHash)
  console.log(`   Password check: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
  
  if (admin.status !== 'Active') {
    console.log(`   ⚠️ Account status is ${admin.status}, not Active`)
    return false
  }
  
  if (!isValid) {
    console.log(`   ❌ LOGIN WOULD FAIL - Wrong password`)
    return false
  }
  
  console.log(`   ✅ LOGIN WOULD SUCCEED`)
  return true
}

async function run() {
  await testLogin('mzsamantha01+master@gmail.com', 'MasterAdmin2026!')
  await testLogin('mzsamantha01+main@gmail.com', 'MainAdmin2026!')
  await testLogin('mzsamantha01@gmail.com', 'ChangeMe123!')
  await prisma.$disconnect()
}

run()
