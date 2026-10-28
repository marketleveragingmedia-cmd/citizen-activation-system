import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Create clean test Strategic Partner for Press Play demo
// DELETE THIS FILE after account is created
export async function POST() {
  try {
    // Check if mzsamantha subdomain already exists
    const existing = await prisma.admin.findFirst({
      where: {
        subdomain: 'mzsamantha'
      }
    })

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Subdomain mzsamantha already exists',
        account: {
          subdomain: existing.subdomain,
          firstName: existing.firstName,
          lastName: existing.lastName,
          email: existing.email,
          status: existing.status
        }
      })
    }

    // Create Strategic Partner account
    const hashedPassword = await bcrypt.hash('PressPlay2026!', 10)
    
    const partner = await prisma.strategicPartner.create({
      data: {
        referralCode: 'MZSAMANTHA',
        firstName: 'Samantha',
        lastName: 'Hill',
        email: 'mzsamantha01@gmail.com',
        phone: '',
        address1: '',
        city: '',
        state: '',
        zip: '',
        status: 'Active',
        availableSlots: 100,
        maxSlots: 100,
        passwordHash: hashedPassword,
        activationLevel: 'None'
      }
    })

    // Create corresponding Admin account for subdomain
    const admin = await prisma.admin.create({
      data: {
        firstName: 'Samantha',
        lastName: 'Hill',
        email: 'mzsamantha01+test@gmail.com',
        hashedPassword: hashedPassword,
        accountType: 'STRATEGIC_PARTNER',
        subdomain: 'mzsamantha',
        status: 'Active',
        strategicPartnerId: partner.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test Strategic Partner account created successfully',
      account: {
        subdomain: admin.subdomain,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        status: admin.status,
        url: `https://mzsamantha.citizenactivation.com/`,
        requestUrl: `https://mzsamantha.citizenactivation.com/request`,
        loginEmail: 'mzsamantha01+test@gmail.com',
        temporaryPassword: 'PressPlay2026!',
        referralCode: partner.referralCode
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
