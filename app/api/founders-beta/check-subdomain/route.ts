import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Reserved subdomains (case-insensitive, dash-insensitive)
const RESERVED_TERMS = [
  'admin', 'beta', 'www', 'api', 'ai', 'clone',
  'founder', 'founders',
  'cash', 'cashflow', 'cash-flow',
  'citizen', 'enterprise',
  'cashflowvisionary', 'cashflowvisionaries', 'cash-flow-visionary', 'cash-flow-visionaries',
  'network', 'networkleveragingcashflow', 'network-leveraging-cash-flow',
  'mzsamantha',
  'strategicpartner', 'strategic-partner'
]

function normalizeSubdomain(subdomain: string): string {
  return subdomain.toLowerCase().replace(/-/g, '')
}

function isReserved(subdomain: string): boolean {
  const normalized = normalizeSubdomain(subdomain)
  return RESERVED_TERMS.some(term => normalizeSubdomain(term) === normalized)
}

function validateFormat(subdomain: string): { valid: boolean; error?: string } {
  // Must be 3-30 characters
  if (subdomain.length < 3 || subdomain.length > 30) {
    return { valid: false, error: 'Subdomain must be 3-30 characters' }
  }

  // Must start with a letter
  if (!/^[a-z]/.test(subdomain)) {
    return { valid: false, error: 'Subdomain must start with a letter' }
  }

  // Only lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return { valid: false, error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' }
  }

  // Cannot start or end with hyphen
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return { valid: false, error: 'Subdomain cannot start or end with a hyphen' }
  }

  // No consecutive hyphens
  if (subdomain.includes('--')) {
    return { valid: false, error: 'Subdomain cannot contain consecutive hyphens' }
  }

  return { valid: true }
}

export async function POST(request: Request) {
  try {
    const { subdomain } = await request.json()

    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 })
    }

    const normalizedSubdomain = subdomain.toLowerCase().trim()

    // Validate format
    const formatCheck = validateFormat(normalizedSubdomain)
    if (!formatCheck.valid) {
      return NextResponse.json({
        available: false,
        reason: 'invalid',
        message: formatCheck.error
      })
    }

    // Check if reserved
    if (isReserved(normalizedSubdomain)) {
      return NextResponse.json({
        available: false,
        reason: 'reserved',
        message: 'This subdomain is reserved'
      })
    }

    // Check database for existing subdomains
    const [existingFounder, existingPartner, existingTeam, existingAdmin] = await Promise.all([
      prisma.founderBeta.findFirst({
        where: {
          OR: [
            { subdomainOption1: normalizedSubdomain },
            { subdomainOption2: normalizedSubdomain }
          ]
        }
      }),
      prisma.strategicPartner.findFirst({
        where: { subdomain: normalizedSubdomain }
      }),
      prisma.team.findFirst({
        where: { subdomain: normalizedSubdomain }
      }),
      prisma.admin.findFirst({
        where: { subdomain: normalizedSubdomain }
      })
    ])

    if (existingFounder || existingPartner || existingTeam || existingAdmin) {
      return NextResponse.json({
        available: false,
        reason: 'taken',
        message: 'This subdomain is already taken'
      })
    }

    // Available!
    return NextResponse.json({
      available: true,
      subdomain: normalizedSubdomain,
      message: `"${normalizedSubdomain}" is available!`
    })

  } catch (error) {
    console.error('Check subdomain error:', error)
    return NextResponse.json(
      { error: 'Failed to check subdomain availability' },
      { status: 500 }
    )
  }
}

// CORS support
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
