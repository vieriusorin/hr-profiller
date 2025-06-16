import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

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

type AllocationResponse = z.infer<typeof AllocationResponseSchema>;

export const useAllocationCheck = ({
  employeeIds,
  startDate,
  endDate,
  currentOpportunityId,
  currentRoleId,
  currentAllocation,
  enabled = true,
}: {
  employeeIds: string[];
  startDate: string;
  endDate?: string;
  currentOpportunityId?: string;
  currentRoleId?: string;
  currentAllocation?: number;
  enabled?: boolean;
}) => {
  // Add debug logging for hook parameters
  console.log('useAllocationCheck Parameters:', {
    employeeIds,
    startDate,
    endDate,
    currentOpportunityId,
    currentRoleId,
    currentAllocation,
    enabled,
  });

  const { data, isLoading, error } = useQuery<AllocationResponse>({
    queryKey: ['allocation-check', employeeIds, startDate, endDate, currentOpportunityId, currentRoleId, currentAllocation],
    queryFn: async () => {
      console.log('Making allocation check API call with:', {
        employeeIds,
        startDate,
        endDate,
        currentOpportunityId,
        currentRoleId,
        currentAllocation,
      });

      const response = await fetch('/api/employees/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeIds,
          startDate,
          endDate,
          currentOpportunityId,
          currentRoleId,
          currentAllocation,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Allocation check API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error('Failed to check allocations');
      }

      const responseData = await response.json();
      console.log('Allocation check API response:', responseData);
      return AllocationResponseSchema.parse(responseData);
    },
    enabled: enabled && employeeIds.length > 0 && typeof currentAllocation === 'number',
  });

  // Add debug logging for query results
  console.log('useAllocationCheck Query Results:', {
    data,
    isLoading,
    error,
    enabled: enabled && employeeIds.length > 0 && typeof currentAllocation === 'number',
  });

  const getAllocationWarning = () => {
    if (!data || typeof currentAllocation !== 'number') {
      console.log('No allocation warning - missing data or currentAllocation:', {
        hasData: !!data,
        currentAllocation,
      });
      return null;
    }

    let warningMessage = '';
    let isOverAllocated = false;

    data.allocations.forEach(({ name, totalAllocation }) => {
      const finalAllocation = totalAllocation + currentAllocation;
      if (finalAllocation > 100) {
        warningMessage += `${name} will be over-allocated at ${finalAllocation}%. `;
        isOverAllocated = true;
      } else if (finalAllocation === 100) {
        warningMessage += `${name} will be at 100% allocation. `;
      }
    });

    const warning = {
      message: warningMessage || null,
      isOverAllocated,
    };

    console.log('Allocation warning calculated:', warning);
    return warning;
  };

  return {
    data,
    isLoading,
    error,
    getAllocationWarning,
  };
}; 