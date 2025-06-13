import { NextResponse } from 'next/server';
import { Role, EditRoleForm } from '@/shared/types';

const JSON_SERVER_URL = 'http://localhost:3001';

export async function PUT(request: Request, { params }: { params: { opportunityId: string, roleId: string } }) {
  try {
    const { status } = await request.json();

    const oppResponse = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`);
    if (!oppResponse.ok) throw new Error('Failed to fetch opportunity before updating role');
    const opportunity = await oppResponse.json();

    const roleIndex = opportunity.roles.findIndex((role: Role) => role.id === params.roleId);

    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update the role status in the opportunity object
    opportunity.roles[roleIndex].status = status;

    // Update the entire opportunity in JSON Server
    const response = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: opportunity.roles }),
    });

    if (!response.ok) {
        throw new Error(`Failed to update role status on json-server: ${response.statusText}`);
    }
    const updatedOpportunity = await response.json();

    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to update role status:', errorMessage);
    return NextResponse.json({ error: `Failed to update role status: ${errorMessage}` }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { opportunityId: string, roleId: string } }) {
  try {
    const roleData: EditRoleForm = await request.json();

    const oppResponse = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`);
    if (!oppResponse.ok) throw new Error('Failed to fetch opportunity before updating role');
    const opportunity = await oppResponse.json();

    const roleIndex = opportunity.roles.findIndex((role: Role) => role.id === params.roleId);

    if (roleIndex === -1) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update the role in the opportunity object
    opportunity.roles[roleIndex] = {
      ...opportunity.roles[roleIndex],
      ...roleData
    };

    // Update the entire opportunity in JSON Server
    const response = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: opportunity.roles }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update role on json-server: ${response.statusText}`);
    }
    const updatedOpportunity = await response.json();

    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to update role:', errorMessage);
    return NextResponse.json({ error: `Failed to update role: ${errorMessage}` }, { status: 500 });
  }
} 