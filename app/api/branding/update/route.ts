import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/branding/update
 * 
 * Update organization branding settings
 * Organization Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Organization Admin can update branding
    if (session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Only Organization Admins can update branding' 
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      organizationName,
      welcomeMessage,
      primaryColor,
      secondaryColor,
      emailFromName,
      hidePlatformBranding,
      logoUrl
    } = body

    // Validate organization name
    if (!organizationName || organizationName.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Organization name is required' 
      }, { status: 400 })
    }

    if (organizationName.length > 100) {
      return NextResponse.json({ 
        error: 'Organization name must be 100 characters or less' 
      }, { status: 400 })
    }

    // Validate welcome message length
    if (welcomeMessage && welcomeMessage.length > 500) {
      return NextResponse.json({ 
        error: 'Welcome message must be 500 characters or less' 
      }, { status: 400 })
    }

    // Validate hex colors
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      return NextResponse.json({ 
        error: 'Primary color must be a valid hex color (#RRGGBB)' 
      }, { status: 400 })
    }

    if (secondaryColor && !hexColorRegex.test(secondaryColor)) {
      return NextResponse.json({ 
        error: 'Secondary color must be a valid hex color (#RRGGBB)' 
      }, { status: 400 })
    }

    // Get admin's team
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      include: { team: true }
    })

    if (!admin || !admin.teamId) {
      return NextResponse.json({ 
        error: 'Admin team not found' 
      }, { status: 404 })
    }

    // Update team branding
    const updatedTeam = await prisma.team.update({
      where: { id: admin.teamId },
      data: {
        organizationName: organizationName.trim(),
        welcomeMessage: welcomeMessage?.trim() || null,
        primaryColor: primaryColor || null,
        secondaryColor: secondaryColor || null,
        emailFromName: emailFromName?.trim() || null,
        hidePlatformBranding: hidePlatformBranding || false,
        logoUrl: logoUrl || admin.team.logoUrl // Keep existing if not updated
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully',
      team: {
        id: updatedTeam.id,
        organizationName: updatedTeam.organizationName,
        logoUrl: updatedTeam.logoUrl,
        primaryColor: updatedTeam.primaryColor,
        secondaryColor: updatedTeam.secondaryColor
      }
    })

  } catch (error: any) {
    console.error('Branding update error:', error)
    return NextResponse.json(
      { error: 'Failed to update branding', details: error.message },
      { status: 500 }
    )
  }
}
