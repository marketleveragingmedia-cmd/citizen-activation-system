import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'drifllc.marketing+345@gmail.com' },
    include: { strategicPartner: true }
  });
  
  console.log('User:', user ? {
    email: user.email,
    role: user.role,
    hasPassword: !!user.password,
    partner: user.strategicPartner ? {
      name: `${user.strategicPartner.firstName} ${user.strategicPartner.lastName}`,
      status: user.strategicPartner.status
    } : null
  } : 'NOT FOUND');
  
  await prisma.$disconnect();
}

check().catch(console.error);
