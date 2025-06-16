import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/system-roles/[roleId]
export async function GET(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    const role = await prisma.systemRole.findUnique({
      where: { id: params.roleId },
      include: { permissions: true }
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Failed to fetch system role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system role' },
      { status: 500 }
    );
  }
}

// PATCH /api/system-roles/[roleId]
export async function PATCH(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    const data = await request.json();
    
    // First, update the role's basic information
    const updatedRole = await prisma.systemRole.update({
      where: { id: params.roleId },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
    });

    // Then, update permissions
    if (data.permissions) {
      // Delete all existing permissions
      await prisma.permission.deleteMany({
        where: {
          roles: {
            some: {
              id: params.roleId
            }
          }
        }
      });

      // Create new permissions
      await prisma.systemRole.update({
        where: { id: params.roleId },
        data: {
          permissions: {
            create: data.permissions.map((permission: string) => ({
              name: permission
            }))
          }
        }
      });
    }

    // Fetch the updated role with permissions
    const roleWithPermissions = await prisma.systemRole.findUnique({
      where: { id: params.roleId },
      include: { permissions: true }
    });

    return NextResponse.json(roleWithPermissions);
  } catch (error) {
    console.error('Failed to update system role:', error);
    return NextResponse.json(
      { error: 'Failed to update system role' },
      { status: 500 }
    );
  }
}

// DELETE /api/system-roles/[roleId]
export async function DELETE(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    await prisma.systemRole.delete({
      where: { id: params.roleId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete system role:', error);
    return NextResponse.json(
      { error: 'Failed to delete system role' },
      { status: 500 }
    );
  }
} 