import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  let profileData = null

  if (session.user.type === 'partner') {
    profileData = await prisma.strategicPartner.findUnique({
      where: { id: session.user.id }
    })
  } else if (session.user.type === 'admin') {
    profileData = await prisma.admin.findUnique({
      where: { id: session.user.id }
    })
  }

  if (!profileData) {
    return <div>Error loading profile</div>
  }

  return (
    <ProfileForm
      user={session.user}
      profileData={profileData}
    />
  )
}
