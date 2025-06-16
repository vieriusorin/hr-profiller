import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const AllocationResponseSchema = z.object({
  totalAllocation: z.number().min(0),
  roles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    allocation: z.number(),
  })),
});

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const roles = await prisma.systemRole.findMany({
      where: {
        users: {
          some: {
            id: params.userId
          }
        }
      },
      select: {
        id: true,
        name: true,
        allocation: true,
      }
    });

    const totalAllocation = roles.reduce((sum, role) => sum + (role.allocation || 0), 0);

    const response = {
      totalAllocation,
      roles,
    };

    const validated = AllocationResponseSchema.parse(response);
    return NextResponse.json(validated);
  } catch (error) {
    console.error('Failed to fetch user allocations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user allocations' },
      { status: 500 }
    );
  }
} 