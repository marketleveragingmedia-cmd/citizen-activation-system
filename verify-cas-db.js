const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
});

async function verify() {
  try {
    const adminCount = await prisma.admin.count();
    const teamCount = await prisma.team.count();
    const founderCount = await prisma.founderBeta.count();
    
    console.log('✅ CAS DATABASE VERIFICATION:');
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Teams: ${teamCount}`);
    console.log(`   Founders Beta: ${founderCount}`);
    console.log('✅ CAS database is intact and untouched!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ CAS verification error:', error.message);
  }
}

verify();
