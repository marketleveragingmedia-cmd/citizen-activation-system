import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
})

async function check() {
  console.log('Checking if schema change broke anything...\n')
  
  try {
    const master = await prisma.admin.findUnique({
      where: { email: 'mzsamantha01+master@gmail.com' }
    })
    
    console.log('✅ Can query admin')
    console.log('Email:', master?.email)
    console.log('Has referralCode field:', 'referralCode' in (master || {}))
    console.log('referralCode value:', master?.referralCode || 'NULL')
    
    // Check if referralCode is causing issues
    if (!master?.referralCode) {
      console.log('\n⚠️ ISSUE FOUND: referralCode is NULL but schema requires it!')
      console.log('Fixing by adding a temporary referralCode...')
      
      await prisma.admin.update({
        where: { email: 'mzsamantha01+master@gmail.com' },
        data: { referralCode: 'TEMP-MASTER-001' }
      })
      
      console.log('✅ Fixed - added referralCode: TEMP-MASTER-001')
    }
    
  } catch (error: any) {
    console.error('❌ ERROR:', error.message)
  }
  
  await prisma.$disconnect()
}

check()
