import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Reserved subdomains that cannot be used
const RESERVED_SUBDOMAINS = [
  'www',
  'admin',
  'api',
  'app',
  'hub',
  'master',
  'system',
  'support',
  'help',
  'mail',
  'email',
  'test',
  'dev',
  'staging',
  'prod',
  'production',
]

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json()

    if (!subdomain) {
      return NextResponse.json(
        { valid: false, error: 'Subdomain is required' },
        { status: 400 }
      )
    }

    // Convert to lowercase for consistency
    const cleanSubdomain = subdomain.toLowerCase().trim()

    // Validation 1: Length check (3-20 characters)
    if (cleanSubdomain.length < 3 || cleanSubdomain.length > 20) {
      return NextResponse.json({
        valid: false,
        error: 'Subdomain must be between 3-20 characters',
        warning: null,
      })
    }

    // Validation 2: Format check (alphanumeric + hyphens, must start/end with letter or number)
    const validFormat = /^[a-z0-9]+(-[a-z0-9]+)*$/
    if (!validFormat.test(cleanSubdomain)) {
      return NextResponse.json({
        valid: false,
        error: 'Use only letters, numbers, and hyphens (cannot start/end with hyphen)',
        warning: null,
      })
    }

    // Validation 3: Reserved words check
    if (RESERVED_SUBDOMAINS.includes(cleanSubdomain)) {
      return NextResponse.json({
        valid: false,
        error: 'This subdomain is reserved and cannot be used',
        warning: null,
      })
    }

    // Validation 4: Check if already taken (case-insensitive)
    const existing = await prisma.admin.findFirst({
      where: {
        subdomain: {
          equals: cleanSubdomain,
          mode: 'insensitive',
        },
      },
    })

    if (existing) {
      return NextResponse.json({
        valid: false,
        error: 'This subdomain is already taken',
        warning: null,
      })
    }

    // Soft warning: 15+ characters
    const warning =
      cleanSubdomain.length >= 15
        ? '⚠️ Consider a shorter subdomain for easier sharing'
        : null

    // All checks passed
    return NextResponse.json({
      valid: true,
      error: null,
      warning,
      subdomain: cleanSubdomain, // Return cleaned version
    })
  } catch (error: any) {
    console.error('Subdomain validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Validation failed', warning: null },
      { status: 500 }
    )
  }
}
