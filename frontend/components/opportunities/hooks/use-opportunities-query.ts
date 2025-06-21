import { useOpportunities as useOpportunitiesHook, useOpportunity, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '@/lib/hooks';
import { type Opportunity, type CreateOpportunity as CreateOpportunityType, type UpdateOpportunity as UpdateOpportunityType } from '@/lib/api-client';

// Re-export the hooks for backwards compatibility
export const useOpportunitiesQuery = (filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'In Progress' | 'On Hold' | 'Done';
  client?: string;  // Changed from clientName to client to match backend API
  probability?: string;
}) => {
  const { data, isLoading, error, refetch } = useOpportunitiesHook(filters);

  // Transform the data to match the old interface
  const opportunities = data?.data || [];
  // Map backend status to frontend expectations
  const inProgressOpportunities = opportunities.filter((opp: Opportunity) => opp.status === 'In Progress');
  const onHoldOpportunities = opportunities.filter((opp: Opportunity) => opp.status === 'On Hold');
  const completedOpportunities = opportunities.filter((opp: Opportunity) => opp.status === 'Done');

  return {
    opportunities: inProgressOpportunities,
    onHoldOpportunities,
    completedOpportunities,
    loading: isLoading,
    error,
    validationError: null, // No longer using validation errors
    isRefetching: false,
    fetchNextPageInProgress: () => { },
    hasNextPageInProgress: false,
    isFetchingNextPageInProgress: false,
    fetchNextPageOnHold: () => { },
    hasNextPageOnHold: false,
    isFetchingNextPageOnHold: false,
    fetchNextPageCompleted: () => { },
    hasNextPageCompleted: false,
    isFetchingNextPageCompleted: false,
    hasValidationError: false,
    refetch,
  };
};

export const useCreateOpportunityMutation = () => {
  return useCreateOpportunity();
};

export const useUpdateOpportunityMutation = () => {
  return useUpdateOpportunity();
};

export const useDeleteOpportunityMutation = () => {
  return useDeleteOpportunity();
};

// Simplified versions of other hooks
export const useAddRoleMutation = () => {
  // This would need to be implemented in the backend first
  // For now, return a mock mutation
  return {
    mutate: () => console.warn('Add role mutation not implemented yet'),
    isPending: false,
    error: null,
  };
};

export const useMoveOpportunityMutation = () => {
  // This would be implemented as an update operation
  const updateMutation = useUpdateOpportunity();

  return {
    mutate: ({ opportunityId, targetStatus }: { opportunityId: string; targetStatus: string }) => {
      // Map the old status format to new backend format
      let newStatus: 'In Progress' | 'On Hold' | 'Done';
      switch (targetStatus) {
        case 'in-progress':
          newStatus = 'In Progress';
          break;
        case 'on-hold':
          newStatus = 'On Hold';
          break;
        case 'completed':
          newStatus = 'Done';
          break;
        default:
          newStatus = targetStatus as 'In Progress' | 'On Hold' | 'Done';
      }

      updateMutation.mutate({
        id: opportunityId,
        data: { status: newStatus }
      });
    },
    isPending: updateMutation.isPending,
    error: updateMutation.error,
  };
};

export const useUpdateRoleStatusMutation = () => {
  // This would need to be implemented in the backend first
  return {
    mutate: () => console.warn('Update role status mutation not implemented yet'),
    isPending: false,
    error: null,
  };
};

export const useUpdateRoleMutation = () => {
  // This would need to be implemented in the backend first
  return {
    mutate: () => console.warn('Update role mutation not implemented yet'),
    isPending: false,
    error: null,
  };
};

export const useOpportunityFiltering = () => {
  const filterOpportunities = (opportunities: Opportunity[], filters: any): Opportunity[] => {
    return opportunities.filter((opp: Opportunity) => {
      if (filters.search && !opp.opportunityName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.client && opp.clientName && !opp.clientName.toLowerCase().includes(filters.client.toLowerCase())) {
        return false;
      }
      if (filters.status && opp.status !== filters.status) {
        return false;
      }
      return true;
    });
  };

  return { filterOpportunities };
};

export const useOpportunities = () => {
  return useOpportunitiesHook();
};

export const useOpportunityQuery = (opportunityId: string) => {
  return useOpportunity(opportunityId);
};

// Export types for backwards compatibility
export type { Opportunity, CreateOpportunityType as CreateOpportunity, UpdateOpportunityType as UpdateOpportunity }; 
