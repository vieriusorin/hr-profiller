import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OpportunityFilters } from '@/shared/types';
import { OpportunityService } from '../services/opportunity-service';
import { opportunityApi } from '@/shared/lib/api/mock-data';
import { validatedOpportunityApi, ApiValidationError } from '@/shared/lib/api/validated-api';
import { type Opportunity} from '@/shared/schemas/api-schemas';
import { queryKeys } from '@/shared/lib/query/keys';

export const useOpportunitiesQuery = (filters: OpportunityFilters) => {

  const inProgressQuery = useQuery({
    queryKey: queryKeys.opportunities.inProgress(filters),
    queryFn: async () => {
      const result = await validatedOpportunityApi.getInProgressOpportunities(filters);
      if (result.success) {
        return result.data;
      }
      
      // If we have fallback data, use it but still throw for error handling
      if (result.fallbackData && result.fallbackData.length > 0) {
        console.warn('Using fallback data for in-progress opportunities:', result.error);
        return result.fallbackData;
      }
      
      throw result.error;
    },
    staleTime: 1000 * 60 * 5,
  });

  const onHoldQuery = useQuery({
    queryKey: queryKeys.opportunities.onHold(filters),
    queryFn: async () => {
      const result = await validatedOpportunityApi.getOnHoldOpportunities(filters);
      if (result.success) {
        return result.data;
      }
      
      if (result.fallbackData && result.fallbackData.length > 0) {
        console.warn('Using fallback data for on-hold opportunities:', result.error);
        return result.fallbackData;
      }
      
      throw result.error;
    },
    staleTime: 1000 * 60 * 5,
  });

  const completedQuery = useQuery({
    queryKey: queryKeys.opportunities.completed(filters),
    queryFn: async () => {
      const result = await validatedOpportunityApi.getCompletedOpportunities(filters);
      if (result.success) {
        return result.data;
      }
      
      if (result.fallbackData && result.fallbackData.length > 0) {
        console.warn('Using fallback data for completed opportunities:', result.error);
        return result.fallbackData;
      }
      
      throw result.error;
    },
    staleTime: 1000 * 60 * 10,
  });

  // Enhanced error handling to detect validation errors
  const getValidationError = (): ApiValidationError | null => {
    const errors = [inProgressQuery.error, onHoldQuery.error, completedQuery.error].filter(Boolean);
    const validationError = errors.find(error => error instanceof ApiValidationError);
    return validationError as ApiValidationError || null;
  };

  return {
    opportunities: inProgressQuery.data || [],
    onHoldOpportunities: onHoldQuery.data || [],
    completedOpportunities: completedQuery.data || [],
    loading: inProgressQuery.isLoading || onHoldQuery.isLoading || completedQuery.isLoading,
    error: inProgressQuery.error || onHoldQuery.error || completedQuery.error,
    validationError: getValidationError(),
    isRefetching: inProgressQuery.isRefetching || onHoldQuery.isRefetching || completedQuery.isRefetching,
    // Additional validation state
    hasValidationError: getValidationError() !== null,
    refetch: () => {
      inProgressQuery.refetch();
      onHoldQuery.refetch();
      completedQuery.refetch();
    },
  };
};

export const useCreateOpportunityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunity: Opportunity) => opportunityApi.createOpportunity(opportunity),
    onMutate: async (newOpportunity) => {
      // Cancel outgoing refetches for in-progress opportunities
      await queryClient.cancelQueries({ queryKey: queryKeys.opportunities.inProgress() });

      // Snapshot the previous value
      const previousOpportunities = queryClient.getQueryData<Opportunity[]>(queryKeys.opportunities.inProgress());

      // Optimistically update the cache with a temporary ID
      const optimisticOpportunity = {
        ...newOpportunity,
        id: Date.now(), // Temporary ID
        status: 'In Progress' as const,
        openDate: new Date().toISOString().split('T')[0],
        roles: []
      };

      queryClient.setQueryData(
        queryKeys.opportunities.inProgress(),
        (old: Opportunity[] = []) => [...old, optimisticOpportunity]
      );

      return { previousOpportunities, optimisticOpportunity };
    },
    onSuccess: (newOpportunity, variables, context) => {
      // Replace the optimistic opportunity with the real one from the server
      queryClient.setQueryData(
        queryKeys.opportunities.inProgress(),
        (old: Opportunity[] = []) => {
          // Remove the optimistic opportunity and add the real one
          const filtered = old.filter(opp => opp.id !== context?.optimisticOpportunity.id);
          return [...filtered, newOpportunity];
        }
      );
    },
    onError: (error, newOpportunity, context) => {
      // Rollback to the previous state
      if (context?.previousOpportunities) {
        queryClient.setQueryData(queryKeys.opportunities.inProgress(), context.previousOpportunities);
      }
      console.error('Failed to create opportunity:', error);
    },
    onSettled: () => {
      // Invalidate to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.inProgress() });
    },
  });
};

export const useAddRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opportunityId, roleData }: { opportunityId: number; roleData: any }) => 
      opportunityApi.addRoleToOpportunity(opportunityId, roleData),
    onMutate: async ({ opportunityId, roleData }) => {
      // Find which list the opportunity is in
      const inProgressKey = queryKeys.opportunities.inProgress();
      const onHoldKey = queryKeys.opportunities.onHold();
      
      const inProgressOpps = queryClient.getQueryData<Opportunity[]>(inProgressKey) || [];
      const onHoldOpps = queryClient.getQueryData<Opportunity[]>(onHoldKey) || [];
      
      const isInProgress = inProgressOpps.some(opp => opp.id === opportunityId);
      const targetKey = isInProgress ? inProgressKey : onHoldKey;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: targetKey });
      
      // Snapshot previous value
      const previousOpportunities = queryClient.getQueryData<Opportunity[]>(targetKey);
      
      // Optimistically update the cache
      const optimisticRole = {
        ...roleData,
        id: Date.now(), // Temporary ID
        status: 'Open' as const,
        assignedMember: null,
        needsHire: false,
      };
      
      queryClient.setQueryData(targetKey, (old: Opportunity[] = []) =>
        old.map(opp => 
          opp.id === opportunityId 
            ? { ...opp, roles: [...opp.roles, optimisticRole] }
            : opp
        )
      );
      
      return { previousOpportunities, targetKey, optimisticRole };
    },
    onSuccess: (updatedOpportunity, variables, context) => {
      // Replace with real data from server
      if (context) {
        queryClient.setQueryData(context.targetKey, (old: Opportunity[] = []) =>
          old.map(opp => opp.id === updatedOpportunity.id ? updatedOpportunity : opp)
        );
      }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousOpportunities) {
        queryClient.setQueryData(context.targetKey, context.previousOpportunities);
      }
      console.error('Failed to add role:', error);
      
      // Only invalidate on error to ensure we get fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.inProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.onHold() });
    },
    // Remove onSettled - we don't want to invalidate after successful updates
  });
};

export const useMoveOpportunityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      opportunityId, 
      fromStatus, 
      toStatus 
    }: { 
      opportunityId: number; 
      fromStatus: 'in-progress' | 'on-hold' | 'completed';
      toStatus: 'in-progress' | 'on-hold' | 'completed';
    }) => {
      const status = toStatus === 'in-progress' ? 'In Progress' : 
                    toStatus === 'on-hold' ? 'On Hold' : 'Done';
      return opportunityApi.moveOpportunity(opportunityId, status);
    },
    onMutate: async ({ opportunityId, fromStatus, toStatus }) => {
      const fromKey = queryKeys.opportunities.list(fromStatus);
      const toKey = queryKeys.opportunities.list(toStatus);
      
      await queryClient.cancelQueries({ queryKey: fromKey });
      await queryClient.cancelQueries({ queryKey: toKey });

      const previousFrom = queryClient.getQueryData<Opportunity[]>(fromKey);
      const previousTo = queryClient.getQueryData<Opportunity[]>(toKey);

      const opportunity = previousFrom?.find(opp => opp.id === opportunityId);
      if (opportunity && previousFrom && previousTo) {
        const updatedOpportunity = OpportunityService.changeOpportunityStatus(
          opportunity,
          toStatus === 'in-progress' ? 'In Progress' : 
          toStatus === 'on-hold' ? 'On Hold' : 'Done'
        );

        queryClient.setQueryData(fromKey, previousFrom.filter(opp => opp.id !== opportunityId));
        queryClient.setQueryData(toKey, [...previousTo, updatedOpportunity]);
      }

      return { previousFrom, previousTo, fromKey, toKey };
    },
    onSuccess: (updatedOpportunity, { fromStatus, toStatus }) => {
      const fromKey = queryKeys.opportunities.list(fromStatus);
      const toKey = queryKeys.opportunities.list(toStatus);
      
      // Update with the actual server response
      queryClient.setQueryData(fromKey, (old: Opportunity[] = []) => 
        old.filter(opp => opp.id !== updatedOpportunity.id)
      );
      queryClient.setQueryData(toKey, (old: Opportunity[] = []) => {
        const filtered = old.filter(opp => opp.id !== updatedOpportunity.id);
        return [...filtered, updatedOpportunity];
      });
    },
    onError: (error, variables, context) => {
      if (context) {
        queryClient.setQueryData(context.fromKey, context.previousFrom);
        queryClient.setQueryData(context.toKey, context.previousTo);
      }
    },
    onSettled: (data, error, { fromStatus, toStatus }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.list(fromStatus) });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.list(toStatus) });
    },
  });
};

export const useUpdateOpportunityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      opportunityId, 
      updatedOpportunity, 
      listType 
    }: { 
      opportunityId: number; 
      updatedOpportunity: Opportunity; 
      listType: 'in-progress' | 'on-hold' | 'completed';
    }) => {
      return opportunityApi.updateOpportunity(updatedOpportunity);
    },
    onSuccess: (updatedOpportunity, { listType }) => {
      const queryKey = queryKeys.opportunities.list(listType);
      
      queryClient.setQueryData(queryKey, (old: Opportunity[] = []) =>
        old.map(opp => opp.id === updatedOpportunity.id ? updatedOpportunity : opp)
      );
    },
  });
};

export const useUpdateRoleStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      opportunityId, 
      roleId, 
      status 
    }: { 
      opportunityId: number; 
      roleId: number; 
      status: string;
    }) => {
      return opportunityApi.updateRoleStatus(opportunityId, roleId, status);
    },
    onSuccess: (updatedOpportunity, { opportunityId }) => {
      // Update the opportunity in all relevant query caches
      const inProgressKey = queryKeys.opportunities.inProgress();
      const onHoldKey = queryKeys.opportunities.onHold();
      const completedKey = queryKeys.opportunities.completed();
      
      [inProgressKey, onHoldKey, completedKey].forEach(key => {
        queryClient.setQueryData(key, (old: Opportunity[] = []) =>
          old.map(opp => opp.id === opportunityId ? updatedOpportunity : opp)
        );
      });
    },
  });
};

export const useOpportunityFiltering = () => {
  const filterOpportunities = (opportunities: Opportunity[], filters: OpportunityFilters): Opportunity[] => {
    return opportunities.filter(opp => {
      const clientMatch = OpportunityService.filterByClient(opp, filters.client);
      const gradeMatch = !filters.grades || filters.grades.length === 0 || opp.roles.some(role => filters.grades.includes(role.requiredGrade));
      const hireMatch = OpportunityService.filterByHiringNeeds(opp, filters.needsHire);
      const probabilityMatch = !filters.probability || (opp.probability >= filters.probability[0] && opp.probability <= filters.probability[1]);
      
      return clientMatch && gradeMatch && hireMatch && probabilityMatch;
    });
  };

  return { filterOpportunities };
};

export const useOpportunities = () => {
  const { filters } = useOpportunityFiltering();
  const queries = useOpportunitiesQuery(filters);
  const createMutation = useCreateOpportunityMutation();
  const addRoleMutation = useAddRoleMutation();
  const moveMutation = useMoveOpportunityMutation();
  const updateMutation = useUpdateOpportunityMutation();
  const updateRoleStatusMutation = useUpdateRoleStatusMutation();
  const { filterOpportunities } = useOpportunityFiltering();

  return {
    ...queries,
    addOpportunity: createMutation.mutate,
    addRole: addRoleMutation.mutate,
    moveToOnHold: (opportunityId: number) => 
      moveMutation.mutate({ opportunityId, fromStatus: 'in-progress', toStatus: 'on-hold' }),
    moveToInProgress: (opportunityId: number) => 
      moveMutation.mutate({ opportunityId, fromStatus: 'on-hold', toStatus: 'in-progress' }),
    moveToCompleted: (opportunityId: number, fromStatus: 'in-progress' | 'on-hold') => 
      moveMutation.mutateAsync({ opportunityId, fromStatus, toStatus: 'completed' }),
    updateOpportunityInList: (opportunityId: number, updatedOpportunity: Opportunity, list: 'inProgress' | 'onHold') => 
      updateMutation.mutate({ 
        opportunityId, 
        updatedOpportunity, 
        listType: list === 'inProgress' ? 'in-progress' : 'on-hold' 
      }),
    updateRoleStatus: (opportunityId: number, roleId: number, status: string) =>
      updateRoleStatusMutation.mutateAsync({ opportunityId, roleId, status }),
    filterOpportunities,
    
    isCreating: createMutation.isPending,
    isAddingRole: addRoleMutation.isPending,
    isMoving: moveMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingRole: updateRoleStatusMutation.isPending,
  };
}; 