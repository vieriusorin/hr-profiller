import { NextResponse } from 'next/server';

const JSON_SERVER_URL = 'http://localhost:3001';

export async function PUT(request: Request, { params }: { params: Promise<{ opportunityId: string }> }) {
  try {
    const opportunity = await request.json();
    const { opportunityId } = await params;

    // Get current opportunity to check existing active status
    const currentResponse = await fetch(`${JSON_SERVER_URL}/opportunities/${opportunityId}`);
    if (!currentResponse.ok) throw new Error('Failed to fetch current opportunity');
    const currentOpportunity = await currentResponse.json();

    // Auto-activate logic: if probability >= 80% and not manually deactivated
    const updatedOpportunity = { ...opportunity };

    if (opportunity.probability >= 80 && !currentOpportunity.isActive) {
      // Auto-activate if probability increased to >=80%
      updatedOpportunity.isActive = true;
      updatedOpportunity.activatedAt = new Date().toISOString().split('T')[0];
    } else if (opportunity.probability < 80 && currentOpportunity.isActive && currentOpportunity.activatedAt === currentOpportunity.createdAt) {
      // Auto-deactivate only if it was auto-activated (activatedAt = createdAt)
      updatedOpportunity.isActive = false;
      updatedOpportunity.activatedAt = null;
    }

    const response = await fetch(`${JSON_SERVER_URL}/opportunities/${opportunityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOpportunity),
    });
    if (!response.ok) {
      throw new Error(`Failed to update opportunity on json-server: ${response.statusText}`);
    }
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to update opportunity:', errorMessage);
    return NextResponse.json({ error: `Failed to update opportunity: ${errorMessage}` }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ opportunityId: string }> }) {
  try {
    const { opportunityId } = await params;
    const response = await fetch(`${JSON_SERVER_URL}/opportunities/${opportunityId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch opportunity: ${response.statusText}`);
    }
    const opportunity = await response.json();
    return NextResponse.json(opportunity);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to fetch opportunity:', errorMessage);
    return NextResponse.json({ error: `Failed to fetch opportunity: ${errorMessage}` }, { status: 500 });
  }
} 