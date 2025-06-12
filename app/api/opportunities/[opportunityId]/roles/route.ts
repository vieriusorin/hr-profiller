import { NextResponse } from 'next/server';
import { Role } from '@/shared/types';

const JSON_SERVER_URL = 'http://localhost:3001';

export async function PATCH(request: Request, { params }: { params: { opportunityId: string } }) {
  try {
    const roleData = await request.json();

    const oppResponse = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`);
    if (!oppResponse.ok) throw new Error('Failed to fetch opportunity before adding role');
    const opportunity = await oppResponse.json();

    const newRole: Omit<Role, 'id'> = {
      ...roleData,
      status: 'Open',
      assignedMember: null,
      allocation: 100,
      needsHire: roleData.needsHire === 'Yes',
    };
    
    const updatedRoles = [...opportunity.roles, { ...newRole, id: crypto.randomUUID() }];

    const response = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: updatedRoles }),
    });
    if (!response.ok) {
        throw new Error(`Failed to add role on json-server: ${response.statusText}`);
    }
    const result = await response.json();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to add role:', errorMessage);
    return NextResponse.json({ error: `Failed to add role: ${errorMessage}` }, { status: 500 });
  }
} 