import { NextResponse } from 'next/server';
import { z } from 'zod';

const AllocationCheckSchema = z.object({
  employeeIds: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string().optional(),
  currentOpportunityId: z.string().optional(),
  currentRoleId: z.string().optional(),
});

const AllocationResponseSchema = z.object({
  allocations: z.array(z.object({
    employeeId: z.string(),
    name: z.string(),
    totalAllocation: z.number(),
    allocations: z.array(z.object({
      opportunityId: z.string(),
      roleName: z.string(),
      allocation: z.number(),
      startDate: z.string(),
      endDate: z.string().optional(),
    })),
  })),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeIds, startDate, endDate, currentOpportunityId, currentRoleId } = 
      AllocationCheckSchema.parse(body);

    const res = await fetch('/api/opportunities');
    if (!res.ok) {
      throw new Error('Failed to fetch opportunities');
    }
    const opportunities = await res.json();

    const employeesRes = await fetch('/api/employees');
    if (!employeesRes.ok) {
      throw new Error('Failed to fetch employees');
    }
    const employees = await employeesRes.json();

    const allocations = employeeIds.map(employeeId => {
      const employee = employees.find((e: any) => e.id === employeeId);
      let totalAllocation = 0;
      const employeeAllocations = [];

      for (const opp of opportunities) {
        const oppStartDate = new Date(opp.expectedStartDate);
        const oppEndDate = opp.expectedEndDate ? new Date(opp.expectedEndDate) : null;
        const checkStartDate = new Date(startDate);
        const checkEndDate = endDate ? new Date(endDate) : null;

        if (!oppEndDate || !(oppStartDate <= (checkEndDate || checkStartDate) && 
            (!checkEndDate || oppEndDate >= checkStartDate))) {
          continue;
        }

        for (const role of opp.roles) {
          if (
            role.assignedMemberIds?.includes(employeeId) &&
            !(currentOpportunityId === opp.id && currentRoleId === role.id)
          ) {
            totalAllocation += role.allocation;
            employeeAllocations.push({
              opportunityId: opp.id,
              roleName: role.roleName,
              allocation: role.allocation,
              startDate: opp.expectedStartDate,
              endDate: opp.expectedEndDate,
            });
          }
        }
      }

      return {
        employeeId,
        name: employee?.name || 'Unknown Employee',
        totalAllocation,
        allocations: employeeAllocations,
      };
    });

    const response = { allocations };
    const validated = AllocationResponseSchema.parse(response);
    
    return NextResponse.json(validated);
  } catch (error) {
    console.error('Failed to check allocations:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, 
        { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to check allocations' },
      { status: 500 }
    );
  }
} 