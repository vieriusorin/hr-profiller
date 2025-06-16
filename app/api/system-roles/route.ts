import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Permission, UserRole } from '@/lib/rbac';

// GET /api/system-roles
export async function GET() {
  try {
    const roles = await prisma.systemRole.findMany({
      include: {
        permissions: true
      }
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Failed to fetch system roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system roles' },
      { status: 500 }
    );
  }
}

// POST /api/system-roles
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const role = await prisma.systemRole.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          create: data.permissions.map((permission: string) => ({
            name: permission
          }))
        }
      },
      include: {
        permissions: true
      }
    });
    return NextResponse.json(role);
  } catch (error) {
    console.error('Failed to create system role:', error);
    return NextResponse.json(
      { error: 'Failed to create system role' },
      { status: 500 }
    );
  }
} 