const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partner = await prisma.strategicPartner.findFirst({
    where: { email: 'test.partner@example.com' }
  });
  console.log(JSON.stringify(partner, null, 2));
}

main().finally(() => prisma.$disconnect());
