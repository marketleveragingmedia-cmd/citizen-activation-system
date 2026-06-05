import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check if admin
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email }
        })

        if (admin) {
          const isValid = await bcrypt.compare(credentials.password, admin.passwordHash)
          if (isValid && admin.status === 'Active') {
            return {
              id: admin.id,
              email: admin.email,
              name: `${admin.firstName} ${admin.lastName}`,
              firstName: admin.firstName,
              lastName: admin.lastName,
              role: admin.role,
              type: 'admin',
              teamId: admin.teamId,
              isFounder: admin.isFounder || false
            } as any
          }
        }

        // Check if strategic partner
        const partner = await prisma.strategicPartner.findUnique({
          where: { email: credentials.email }
        })

        if (partner) {
          const isValid = await bcrypt.compare(credentials.password, partner.passwordHash)
          if (isValid && partner.status === 'Active') {
            return {
              id: partner.id,
              email: partner.email,
              name: `${partner.firstName} ${partner.lastName}`,
              firstName: partner.firstName,
              lastName: partner.lastName,
              role: 'STRATEGIC_PARTNER',
              type: 'partner',
              teamId: partner.teamId
            } as any
          }
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.type = user.type
        token.teamId = user.teamId
        token.isFounder = user.isFounder || false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.type = token.type as string
        session.user.teamId = token.teamId as string
        session.user.isFounder = token.isFounder as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
