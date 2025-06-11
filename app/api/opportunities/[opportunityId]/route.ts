import { NextResponse } from 'next/server';

const JSON_SERVER_URL = 'http://localhost:3001';

export async function PUT(request: Request, { params }: { params: { opportunityId: string } }) {
  try {
    const opportunity = await request.json();
    const response = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opportunity),
    });
    if (!response.ok) {
        throw new Error(`Failed to update opportunity on json-server: ${response.statusText}`);
    }
    const updatedOpportunity = await response.json();
    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to update opportunity:', errorMessage);
    return NextResponse.json({ error: `Failed to update opportunity: ${errorMessage}` }, { status: 500 });
  }
} 