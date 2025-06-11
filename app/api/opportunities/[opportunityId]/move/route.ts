import { NextResponse } from 'next/server';

const JSON_SERVER_URL = 'http://localhost:3001';

export async function PATCH(request: Request, { params }: { params: { opportunityId: string } }) {
    try {
      const { toStatus } = await request.json();
              const response = await fetch(`${JSON_SERVER_URL}/opportunities/${params.opportunityId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: toStatus }),
      });
      if (!response.ok) {
          throw new Error(`Failed to move opportunity on json-server: ${response.statusText}`);
      }
      const movedOpportunity = await response.json();
      return NextResponse.json(movedOpportunity);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Failed to move opportunity:', errorMessage);
      return NextResponse.json({ error: `Failed to move opportunity: ${errorMessage}` }, { status: 500 });
    }
} 