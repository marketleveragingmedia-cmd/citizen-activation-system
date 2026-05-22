import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      type: string
      teamId?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    type: string
    teamId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    type: string
    teamId?: string
  }
}
