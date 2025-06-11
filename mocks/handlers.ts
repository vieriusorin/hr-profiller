import { http, HttpResponse } from 'msw';
import { db } from './db';
import { Opportunity, OpportunityFilters } from '@/shared/types';

const applyFilters = (opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[] => {
    let filteredOpps = opportunities;

    if (filters.client) {
        filteredOpps = filteredOpps.filter(opp => opp.clientName.toLowerCase().includes(filters.client.toLowerCase()));
    }
    if (filters.grades && filters.grades.length > 0) {
        filteredOpps = filteredOpps.filter(opp => opp.roles.some(role => filters.grades.includes(role.requiredGrade)));
    }
    if (filters.needsHire && filters.needsHire !== 'all') {
        filteredOpps = filteredOpps.filter(opp => opp.roles.some(role => {
            if (filters.needsHire === 'yes') return role.needsHire === true;
            if (filters.needsHire === 'no') return role.needsHire === false;
            return true;
        }));
    }
    if (filters.probability) {
        const [min, max] = filters.probability;
        filteredOpps = filteredOpps.filter(opp => opp.probability >= min && opp.probability <= max);
    }
    return filteredOpps;
};

const getFiltersFromUrl = (url: URL): OpportunityFilters => {
    const client = url.searchParams.get('client') || '';
    const grades = url.searchParams.get('grades')?.split(',') || [];
    const needsHire = url.searchParams.get('needsHire') || 'all';
    const probabilityStr = url.searchParams.get('probability');
    const probability = probabilityStr ? probabilityStr.split('-').map(Number) as [number, number] : [0, 100];

    return { client, grades, needsHire, probability } as OpportunityFilters;
}

export const handlers = [
    // Get all opportunities with filters
    http.get('/api/opportunities/in-progress', ({ request }) => {
        const url = new URL(request.url);
        const filters = getFiltersFromUrl(url);
        const allOpps = db.opportunities.getAllInProgress();
        const filteredOpps = applyFilters(allOpps, filters);
        return HttpResponse.json(filteredOpps);
    }),
    http.get('/api/opportunities/on-hold', ({ request }) => {
        const url = new URL(request.url);
        const filters = getFiltersFromUrl(url);
        const allOpps = db.opportunities.getAllOnHold();
        const filteredOpps = applyFilters(allOpps, filters);
        return HttpResponse.json(filteredOpps);
    }),
    http.get('/api/opportunities/completed', ({ request }) => {
        const url = new URL(request.url);
        const filters = getFiltersFromUrl(url);
        const allOpps = db.opportunities.getAllCompleted();
        const filteredOpps = applyFilters(allOpps, filters);
        return HttpResponse.json(filteredOpps);
    }),

    // Create opportunity
    http.post('/api/opportunities', async ({ request }) => {
        const data = await request.json() as Partial<Opportunity>;
        const newOpp = db.opportunities.create(data);
        return HttpResponse.json(newOpp, { status: 201 });
    }),

    // Update opportunity
    http.put('/api/opportunities/:id', async ({ request, params }) => {
        const { id } = params;
        const data = await request.json() as Opportunity;
        const updatedOpp = db.opportunities.update(Number(id), data);
        if (!updatedOpp) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(updatedOpp);
    }),

    // Move opportunity
    http.put('/api/opportunities/:id/move', async ({ request, params }) => {
        const { id } = params;
        const { toStatus } = await request.json() as { toStatus: 'In Progress' | 'On Hold' | 'Done' };
        const movedOpp = db.opportunities.move(Number(id), toStatus);
        if (!movedOpp) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(movedOpp);
    }),

    // Add role
    http.post('/api/opportunities/:id/roles', async ({ request, params }) => {
        const { id } = params;
        const roleData = await request.json();
        const updatedOpp = db.opportunities.addRole(Number(id), roleData);
         if (!updatedOpp) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(updatedOpp, { status: 201 });
    }),

    // Update role status
    http.put('/api/opportunities/:oppId/roles/:roleId', async ({ request, params }) => {
        const { oppId, roleId } = params;
        const { status } = await request.json() as { status: string };
        const updatedOpp = db.opportunities.updateRoleStatus(Number(oppId), Number(roleId), status);
        if (!updatedOpp) {
            return new HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(updatedOpp);
    }),
]; 