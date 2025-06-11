import { NextResponse } from 'next/server';

const JSON_SERVER_URL = 'http://localhost:3001';

export async function POST(request: Request) {
  try {
    const opportunity = await request.json();
    const response = await fetch(`${JSON_SERVER_URL}/opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...opportunity,
          status: 'In Progress',
          roles: []
        }),
    });
    if (!response.ok) {
        throw new Error(`Failed to create opportunity on json-server: ${response.statusText}`);
    }
    const newOpportunity = await response.json();
    return NextResponse.json(newOpportunity, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to create opportunity:', errorMessage);
    return NextResponse.json({ error: `Failed to create opportunity: ${errorMessage}` }, { status: 500 });
  }
} 
