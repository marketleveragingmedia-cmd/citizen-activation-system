// API endpoint to create Organization Admin account
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      email = 'demo-orgadmin@citizenactivation.com',
      password = 'DemoOrgAdmin2024!',
      firstName = 'Demo',
      lastName = 'Organization Admin',
      phone = '+1-555-DEMO-ORG',
      teamName = 'Demo Organization',
    } = body;

    // Check if account already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.admin.update({
        where: { email },
        data: { 
          passwordHash: hashedPassword,
          status: 'Active',
        },
      });
      
      return NextResponse.json({
        success: true,
        message: 'Org Admin already exists - password updated',
        credentials: {
          email,
          password,
          loginUrl: 'https://hub.citizenactivation.com/auth/signin',
        },
      });
    }

    // Create or find team
    let team = await prisma.team.findFirst({
      where: { name: teamName },
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: teamName,
          adminId: 'temp',
          tierType: 'SoloOrg', // Organization Admin tier
          autoAssignEnabled: true,
          status: 'Active',
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin account
    const admin = await prisma.admin.create({
      data: {
        role: 'TEAM_ADMIN', // TEAM_ADMIN role with SoloOrg tier = Org Admin
        firstName,
        lastName,
        email,
        phone,
        passwordHash: hashedPassword,
        teamId: team.id,
        status: 'Active',
      },
    });

    // Update team's adminId
    await prisma.team.update({
      where: { id: team.id },
      data: { adminId: admin.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Organization Admin created successfully',
      credentials: {
        email,
        password,
        loginUrl: 'https://hub.citizenactivation.com/auth/signin',
      },
      admin: {
        id: admin.id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role,
        teamId: admin.teamId,
      },
    });

  } catch (error: any) {
    console.error('Error creating Org Admin:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create Org Admin',
      },
      { status: 500 }
    );
  }
}
