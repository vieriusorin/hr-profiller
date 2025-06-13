import { NextResponse } from 'next/server';

const JSON_SERVER_URL = 'http://localhost:3001';

export async function PATCH(request: Request, { params }: { params: { opportunityId: string } }) {
  try {
    const { isActive } = await request.json();
    
    // Get current opportunity
    const oppResponse = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`);
    if (!oppResponse.ok) throw new Error('Failed to fetch opportunity before updating active status');
    const opportunity = await oppResponse.json();

    // Prepare update data
    const updateData: any = {
      isActive: isActive
    };

    // Set activation date based on new status
    if (isActive) {
      // If activating, set current date as activation date (unless already set)
      updateData.activatedAt = opportunity.activatedAt || new Date().toISOString().split('T')[0];
    } else {
      // If deactivating, clear the activation date
      updateData.activatedAt = null;
    }

    // Update the opportunity
    const response = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update opportunity active status on json-server: ${response.statusText}`);
    }

    const updatedOpportunity = await response.json();
    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to update opportunity active status:', errorMessage);
    return NextResponse.json({ error: `Failed to update opportunity active status: ${errorMessage}` }, { status: 500 });
  }
} 