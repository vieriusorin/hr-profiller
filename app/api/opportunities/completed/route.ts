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


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const probabilityParam = searchParams.get('probability')?.split('-').map(Number);
    const needsHireParam = searchParams.get('needsHire');

    const filters: OpportunityFilters = {
      client: searchParams.get('client') || '',
      grades: (searchParams.get('grades')?.split(',') || []) as Grade[],
      needsHire: (needsHireParam === 'yes' || needsHireParam === 'no' ? needsHireParam : 'all'),
      probability: (probabilityParam && probabilityParam.length === 2 ? probabilityParam : [0, 100]) as [number, number],
    };

    const response = await fetch(`${JSON_SERVER_URL}/opportunities?status=Done`);
    if (!response.ok) {
        throw new Error(`Failed to fetch from json-server: ${response.statusText}`);
    }
    const allCompletedOpportunities: Opportunity[] = await response.json();

    const filteredOpportunities = applyFilters(allCompletedOpportunities, filters);
    
    return NextResponse.json(filteredOpportunities);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Failed to fetch completed opportunities:', errorMessage);
    return NextResponse.json({ error: `Failed to fetch completed opportunities: ${errorMessage}` }, { status: 500 });
  }
} 