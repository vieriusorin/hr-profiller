import { useOpportunities as useOpportunitiesHook, useOpportunity, useCreateOpportunity, useUpdateOpportunity, useDeleteOpportunity } from '@/lib/hooks';
import { type Opportunity, type CreateOpportunity as CreateOpportunityType, type UpdateOpportunity as UpdateOpportunityType } from '@/lib/api-client';
import { OpportunityStatus } from '@/lib/backend-types/enums';

export const useOpportunitiesQuery = (filters?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: OpportunityStatus;
  client?: string;
  probability?: string;
}) => {
  const { data, isLoading, error, refetch } = useOpportunitiesHook(filters);

  const opportunities = data?.data || [];
  const inProgressOpportunities = opportunities.filter((opp: Opportunity) => opp.status === 'In Progress');
  const onHoldOpportunities = opportunities.filter((opp: Opportunity) => opp.status === 'On Hold');
  const completedOpportunities = opportunities.filter((opp: Opportunity) => opp.status === 'Done');

  return {
    opportunities: inProgressOpportunities,
    onHoldOpportunities,
    completedOpportunities,
    loading: isLoading,
    error,
    validationError: null,
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

export const useAddRoleMutation = () => {
  return {
    mutate: () => console.warn('Add role mutation not implemented yet'),
    isPending: false,
    error: null,
  };
};

export const useMoveOpportunityMutation = () => {
  const updateMutation = useUpdateOpportunity();

  return {
    mutate: ({ opportunityId, targetStatus }: { opportunityId: string; targetStatus: string }) => {
      let newStatus: OpportunityStatus;
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
          newStatus = targetStatus as OpportunityStatus;
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
  return {
    mutate: () => console.warn('Update role status mutation not implemented yet'),
    isPending: false,
    error: null,
  };
};

export const useUpdateRoleMutation = () => {
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

export type { Opportunity, CreateOpportunityType as CreateOpportunity, UpdateOpportunityType as UpdateOpportunity }; 
