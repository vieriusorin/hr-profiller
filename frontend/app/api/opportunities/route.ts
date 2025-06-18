import { NextResponse } from 'next/server';
import { Grade, Opportunity, OpportunityFilters } from '@/shared/types';

const JSON_SERVER_URL = 'http://localhost:3001';

const applyFilters = (opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[] => {
  return opportunities.filter(opp => {
    const clientMatch = filters.client ? opp.clientName.toLowerCase().includes(filters.client.toLowerCase()) : true;

    const gradeMatch = filters.grades && filters.grades.length > 0
      ? opp.roles.some(role => filters.grades.includes(role.requiredGrade))
      : true;

    const hasHiringNeeds = opp.roles.some(role => role.needsHire);
    const needsHireMatch = filters.needsHire !== 'all'
      ? hasHiringNeeds === (filters.needsHire === 'yes')
      : true;

    const probabilityMatch = opp.probability >= filters.probability[0] && opp.probability <= filters.probability[1];

    return clientMatch && gradeMatch && needsHireMatch && probabilityMatch;
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOpportunity(raw: any) {
  return {
    id: raw.id,
    name: raw.name || raw.opportunityName || '',
    opportunityName: raw.opportunityName || raw.name || '',
    client: raw.client ? raw.client : { id: raw.clientId || '', name: raw.clientName || '' },
    clientName: raw.clientName || (raw.client ? raw.client.name : ''),
    expectedStartDate: raw.expectedStartDate || '',
    status: raw.status,
    probability: raw.probability,
    createdAt: raw.createdAt,
    isActive: raw.isActive ?? false,
    activatedAt: raw.activatedAt,
    roles: raw.roles || [],
    comment: raw.comment,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("_page") || "1");
    const limit = parseInt(searchParams.get("_limit") || "3");
    const status = searchParams.get("status");

    const filters: OpportunityFilters = {
      client: searchParams.get('client') || '',
      grades: (searchParams.get('grades')?.split(',') || []) as Grade[],
      needsHire: (searchParams.get('needsHire') as 'yes' | 'no' | 'all') || 'all',
      probability: (searchParams.get('probability')?.split('-').map(Number) || [0, 100]) as [number, number],
    };

    // Fetch all opportunities without pagination
    const response = await fetch(`${JSON_SERVER_URL}/opportunities`);

    if (!response.ok) {
      throw new Error(`Failed to fetch from json-server: ${response.statusText}`);
    }

    let allOpportunities: Opportunity[] = (await response.json()).map(normalizeOpportunity);

    // Filter by status first
    if (status) {
      allOpportunities = allOpportunities.filter(opp => opp.status === status);
    }

    // Apply all other filters
    const filteredOpportunities = applyFilters(allOpportunities, filters);

    // Manually apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedOpportunities = filteredOpportunities.slice(startIndex, endIndex);

    return NextResponse.json(paginatedOpportunities);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to fetch opportunities:', errorMessage);
    return NextResponse.json({ error: `Failed to fetch opportunities: ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const opportunity = await request.json();

    // Auto-activate if probability >= 80%
    const isActive = opportunity.probability >= 80;
    const activatedAt = isActive ? (opportunity.createdAt || new Date().toISOString().split('T')[0]) : null;

    const response = await fetch(`${JSON_SERVER_URL}/opportunities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...opportunity,
        status: 'In Progress',
        isActive: isActive,
        activatedAt: activatedAt,
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
