import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  // Clear all NextAuth cookies
  const cookieStore = await cookies()
  
  // NextAuth uses these cookie names
  const cookieNames = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Host-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url'
  ]

  cookieNames.forEach(name => {
    cookieStore.set(name, '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
  })

  // Redirect to login
  return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'https://hub.citizenactivation.com'))
}
