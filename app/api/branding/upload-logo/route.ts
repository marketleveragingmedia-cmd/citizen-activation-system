import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { put } from '@vercel/blob'

/**
 * POST /api/branding/upload-logo
 * 
 * Upload organization logo to Vercel Blob storage
 * Organization Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Organization Admin can upload logos
    if (session.user.role !== 'ORG_ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Only Organization Admins can upload logos' 
      }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PNG, JPG, and SVG allowed.' 
      }, { status: 400 })
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 2MB.' 
      }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`logos/${session.user.id}-${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true
    })

    return NextResponse.json({
      success: true,
      url: blob.url
    })

  } catch (error: any) {
    console.error('Logo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo', details: error.message },
      { status: 500 }
    )
  }
}
