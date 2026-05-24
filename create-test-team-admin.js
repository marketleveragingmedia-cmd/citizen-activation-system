const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create a test team
  const team = await prisma.team.create({
    data: {
      name: 'Test Team Organization',
      adminId: 'placeholder', // Will be updated after creating admin
      tierType: 'FullSystem',
      status: 'Active'
    }
  });

  console.log('✓ Created team:', team.name);

  // Create Team Admin
  const hashedPassword = await bcrypt.hash('TestPass123!', 10);
  
  const teamAdmin = await prisma.admin.create({
    data: {
      role: 'TEAM_ADMIN',
      firstName: 'Test',
      lastName: 'TeamAdmin',
      email: 'testteamadmin@example.com',
      passwordHash: hashedPassword,
      teamId: team.id,
      status: 'Active'
    }
  });

  console.log('✓ Created Team Admin:', teamAdmin.email);

  // Update team with admin ID
  await prisma.team.update({
    where: { id: team.id },
    data: { adminId: teamAdmin.id }
  });

  console.log('\n✅ Test Team Admin created successfully!');
  console.log('\nLogin credentials:');
  console.log('Email:', teamAdmin.email);
  console.log('Password: TestPass123!');
  console.log('\nURL: https://hub.citizenactivation.com/login');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
