import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
})

async function check() {
  const teams = await prisma.team.findMany({
    where: {
      tierType: 'FullSystem',
      status: 'Active'
    },
    include: {
      admins: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  })
  
  console.log(JSON.stringify(teams, null, 2))
  
  await prisma.$disconnect()
}

check()
