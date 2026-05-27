import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_Z2fY4VFJpyKM@ep-square-mountain-appxory3-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
})

async function test() {
  const teamAdmin = await prisma.admin.findFirst({
    where: { role: 'TEAM_ADMIN' },
    include: { team: true }
  })
  
  if (!teamAdmin) {
    console.log('No Team Admin found')
    return
  }
  
  console.log('Team Admin ID:', teamAdmin.id)
  console.log('URL:', `/admin/team-admins/${teamAdmin.id}`)
  console.log('API URL:', `/api/admin/team-admin/${teamAdmin.id}`)
  console.log('Team ID:', teamAdmin.teamId)
  console.log('Team Name:', teamAdmin.team?.name)
  
  await prisma.$disconnect()
}

test()
