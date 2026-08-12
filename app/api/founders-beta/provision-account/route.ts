import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is Master Admin
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id }
    })

    if (!admin || admin.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Master Admin only' }, { status: 403 })
    }

    const { founderBetaId } = await request.json()

    if (!founderBetaId) {
      return NextResponse.json({ error: 'Founder Beta ID required' }, { status: 400 })
    }

    // Get Founder Beta record
    const founder = await prisma.founderBeta.findUnique({
      where: { id: founderBetaId }
    })

    if (!founder) {
      return NextResponse.json({ error: 'Founder not found' }, { status: 404 })
    }

    if (founder.casAccountCreated) {
      return NextResponse.json({ error: 'CAS account already created for this Founder' }, { status: 400 })
    }

    if (!founder.intakeCompleted) {
      return NextResponse.json({ error: 'Founder must complete intake first' }, { status: 400 })
    }

    if (!founder.subdomainOption1 && !founder.subdomainOption2) {
      return NextResponse.json({ error: 'Founder must provide subdomain options' }, { status: 400 })
    }

    // Determine role based on tier
    const role = founder.founderLevel.includes('Enterprise') ? 'MAIN_ADMIN' : 'TEAM_ADMIN'
    
    // Use subdomain option 1 (or fall back to option 2)
    const subdomain = founder.subdomainOption1 || founder.subdomainOption2

    if (!subdomain) {
      return NextResponse.json({ error: 'No valid subdomain available' }, { status: 400 })
    }

    // Check if subdomain is already taken
    const existingAdmin = await prisma.admin.findFirst({
      where: { subdomain }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        error: `Subdomain "${subdomain}" is already taken. Please update Founder's subdomain options.` 
      }, { status: 400 })
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Split fullName into first/last
    const nameParts = founder.fullName.split(' ')
    const firstName = nameParts[0] || founder.fullName
    const lastName = nameParts.slice(1).join(' ') || ''

    // Create CAS Admin account
    const newAdmin = await prisma.admin.create({
      data: {
        email: founder.email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: founder.phone,
        role,
        type: 'admin',
        status: 'Active',
        subdomain,
        teamId: null, // Founders don't have a team initially
      }
    })

    // Update Founder Beta record
    await prisma.founderBeta.update({
      where: { id: founder.id },
      data: {
        casAccountCreated: true,
        casAccountCreatedAt: new Date(),
        casAdminId: newAdmin.id,
      }
    })

    console.log(`✅ CAS account created for Founder: ${founder.fullName} (${role})`)

    // TODO: Send welcome email with credentials
    // For now, return the temp password (in production, email it)

    return NextResponse.json({
      success: true,
      message: 'CAS account created successfully',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        role,
        subdomain,
        tempPassword, // In production, don't return this - email it instead
      }
    })

  } catch (error) {
    console.error('Provision account error:', error)
    return NextResponse.json(
      { error: 'Failed to provision CAS account' },
      { status: 500 }
    )
  }
}
