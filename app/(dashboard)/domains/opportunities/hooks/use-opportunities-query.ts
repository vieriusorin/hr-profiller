import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OpportunityFilters } from '@/shared/types';
import { OpportunityService } from '../services/opportunity-service';
import { validatedOpportunityApi, ApiValidationError } from '@/shared/lib/api/validated-api';
import { type Opportunity, type Role, type Grade, type CreateRoleInput } from '@/shared/schemas/api-schemas';
import { queryKeys } from '@/shared/lib/query/keys';
import { useOpportunityFilters } from './useOpportunityFilters';

export const useOpportunitiesQuery = (filters: OpportunityFilters) => {

  const inProgressQuery = useQuery({
    queryKey: queryKeys.opportunities.inProgress(filters),
    queryFn: async () => {
      const result = await validatedOpportunityApi.getInProgressOpportunities(filters);
      if (result.success) {
        return result.data;
      }
      
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
    mutationFn: async (opportunity: Opportunity) => {
      const result = await validatedOpportunityApi.createOpportunity(opportunity);
      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    },
    onMutate: async (newOpportunity: Opportunity) => {
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
    onSuccess: (newOpportunity: Opportunity, variables: Opportunity, context: { previousOpportunities: Opportunity[] | undefined, optimisticOpportunity: any } | undefined) => {
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
    onError: (error: Error, newOpportunity: Opportunity, context: { previousOpportunities: Opportunity[] | undefined, optimisticOpportunity: any } | undefined) => {
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

interface AddRoleVariables {
  opportunityId: string;
  roleData: CreateRoleInput;
}

export const useAddRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Opportunity, Error, AddRoleVariables, { previousOpportunities: Opportunity[] | undefined, targetKey: readonly unknown[], optimisticRole: any }>({
    mutationFn: async ({ opportunityId, roleData }: AddRoleVariables) => {
      const result = await validatedOpportunityApi.addRoleToOpportunity(opportunityId, roleData);
      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    },
    onMutate: async ({ opportunityId, roleData }: AddRoleVariables) => {
      // Find which list the opportunity is in
      const inProgressKey = queryKeys.opportunities.inProgress();
      const onHoldKey = queryKeys.opportunities.onHold();
      
      const inProgressOpps = queryClient.getQueryData<Opportunity[]>(inProgressKey) || [];
      const onHoldOpps = queryClient.getQueryData<Opportunity[]>(onHoldKey) || [];
      
      const isInProgress = inProgressOpps.some((opp: Opportunity) => opp.id === opportunityId);
      const targetKey = isInProgress ? inProgressKey : onHoldKey;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: targetKey });
      
      // Snapshot previous value
      const previousOpportunities = queryClient.getQueryData<Opportunity[]>(targetKey);
      
      // Optimistically update the cache
      const optimisticRole = {
        id: crypto.randomUUID(), // Temporary ID
        status: 'Open' as const,
        assignedMember: null,
        ...roleData,
        allocation: roleData.allocation || 100,
        needsHire: roleData.needsHire,
      };
      
      queryClient.setQueryData(targetKey, (old: Opportunity[] = []) =>
        old.map((opp: Opportunity) => 
          opp.id === opportunityId 
            ? { ...opp, roles: [...opp.roles, optimisticRole] }
            : opp
        )
      );
      
      return { previousOpportunities, targetKey, optimisticRole };
    },
    onSuccess: (updatedOpportunity: Opportunity, variables: AddRoleVariables, context: { previousOpportunities: Opportunity[] | undefined, targetKey: readonly unknown[], optimisticRole: any } | undefined) => {
      // Replace with real data from server
      if (context) {
        queryClient.setQueryData(context.targetKey, (old: Opportunity[] = []) =>
          old.map((opp: Opportunity) => opp.id === updatedOpportunity.id ? updatedOpportunity : opp)
        );
      }
      
      // Invalidate all opportunity caches to ensure fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.inProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.onHold() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.completed() });
    },
    onError: (error: Error, variables: AddRoleVariables, context: { previousOpportunities: Opportunity[] | undefined, targetKey: readonly unknown[], optimisticRole: any } | undefined) => {
      // Rollback on error
      if (context?.previousOpportunities) {
        queryClient.setQueryData(context.targetKey, context.previousOpportunities);
      }
      console.error('Failed to add role:', error);
    },
    onSettled: () => {
      // Always invalidate all opportunity caches after role addition attempt
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.inProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.onHold() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.completed() });
    },
  });
};

export const useMoveOpportunityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      opportunityId, 
      fromStatus, 
      toStatus 
    }: { 
      opportunityId: string; 
      fromStatus: 'in-progress' | 'on-hold' | 'completed';
      toStatus: 'in-progress' | 'on-hold' | 'completed';
    }) => {
      const status = toStatus === 'in-progress' ? 'In Progress' : 
                    toStatus === 'on-hold' ? 'On Hold' : 'Done';
      const result = await validatedOpportunityApi.moveOpportunity(opportunityId, status);
      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    },
    onMutate: async ({ opportunityId, fromStatus, toStatus }: { 
      opportunityId: string; 
      fromStatus: 'in-progress' | 'on-hold' | 'completed';
      toStatus: 'in-progress' | 'on-hold' | 'completed';
    }) => {
      const fromKey = queryKeys.opportunities.list(fromStatus);
      const toKey = queryKeys.opportunities.list(toStatus);
      
      await queryClient.cancelQueries({ queryKey: fromKey });
      await queryClient.cancelQueries({ queryKey: toKey });

      const previousFrom = queryClient.getQueryData<Opportunity[]>(fromKey);
      const previousTo = queryClient.getQueryData<Opportunity[]>(toKey);

      const opportunity = previousFrom?.find((opp: Opportunity) => opp.id === opportunityId);
      if (opportunity && previousFrom && previousTo) {
        const updatedOpportunity = OpportunityService.changeOpportunityStatus(
          opportunity,
          toStatus === 'in-progress' ? 'In Progress' : 
          toStatus === 'on-hold' ? 'On Hold' : 'Done'
        );

        queryClient.setQueryData(fromKey, previousFrom.filter((opp: Opportunity) => opp.id !== opportunityId));
        queryClient.setQueryData(toKey, [...previousTo, updatedOpportunity]);
      }

      return { previousFrom, previousTo, fromKey, toKey };
    },
    onError: (error: Error, variables: { 
      opportunityId: string; 
      fromStatus: 'in-progress' | 'on-hold' | 'completed';
      toStatus: 'in-progress' | 'on-hold' | 'completed';
    }, context: { 
      previousFrom: Opportunity[] | undefined, 
      previousTo: Opportunity[] | undefined,
      fromKey: readonly unknown[],
      toKey: readonly unknown[]
    } | undefined) => {
      if (context) {
        queryClient.setQueryData(context.fromKey, context.previousFrom);
        queryClient.setQueryData(context.toKey, context.previousTo);
      }
    },
    onSettled: (data: Opportunity | undefined, error: Error | null, { fromStatus, toStatus }: { 
      opportunityId: string; 
      fromStatus: 'in-progress' | 'on-hold' | 'completed';
      toStatus: 'in-progress' | 'on-hold' | 'completed';
    }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.list(fromStatus) });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.list(toStatus) });
    },
  });
};

export const useUpdateOpportunityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      opportunityId, 
      updatedOpportunity, 
      listType 
    }: { 
      opportunityId: string; 
      updatedOpportunity: Opportunity; 
      listType: 'in-progress' | 'on-hold' | 'completed';
    }) => {
      const result = await validatedOpportunityApi.updateOpportunity(updatedOpportunity);
      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    },
    onSuccess: (updatedOpportunity: Opportunity, { listType }: {
      opportunityId: string; 
      updatedOpportunity: Opportunity; 
      listType: 'in-progress' | 'on-hold' | 'completed';
    }) => {
      const queryKey = queryKeys.opportunities.list(listType);
      
      queryClient.setQueryData(queryKey, (old: Opportunity[] = []) =>
        old.map((opp: Opportunity) => opp.id === updatedOpportunity.id ? updatedOpportunity : opp)
      );
    },
  });
};

export const useUpdateRoleStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      opportunityId, 
      roleId, 
      status 
    }: { 
      opportunityId: string; 
      roleId: string; 
      status: string;
    }) => {
      const result = await validatedOpportunityApi.updateRoleStatus(opportunityId, roleId, status);
      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    },
    onSettled: () => {
      // Always ensure fresh data after role status update
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.inProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.onHold() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.completed() });
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      opportunityId, 
      roleId, 
      roleData 
    }: { 
      opportunityId: string; 
      roleId: string; 
      roleData: EditRoleForm;
    }) => {
      const result = await validatedOpportunityApi.updateRole(opportunityId, roleId, roleData);
      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    },
    onMutate: async ({ opportunityId, roleId, roleData }) => {
      // Find which list the opportunity is in
      const inProgressKey = queryKeys.opportunities.inProgress();
      const onHoldKey = queryKeys.opportunities.onHold();
      const completedKey = queryKeys.opportunities.completed();
      
      const keys = [inProgressKey, onHoldKey, completedKey];
      
      // Cancel outgoing refetches
      await Promise.all(keys.map(key => queryClient.cancelQueries({ queryKey: key })));
      
      // Snapshot previous values
      const previousData = keys.map(key => queryClient.getQueryData<Opportunity[]>(key));
      
      // Optimistically update the cache
      keys.forEach(key => {
        queryClient.setQueryData(key, (old: Opportunity[] = []) =>
          old.map(opp => {
            if (opp.id === opportunityId) {
              return {
                ...opp,
                roles: opp.roles.map(role => 
                  role.id === roleId ? { ...role, ...roleData } : role
                )
              };
            }
            return opp;
          })
        );
      });
      
      return { previousData, keys };
    },
    onSuccess: (updatedOpportunity, { opportunityId }) => {
      const inProgressKey = queryKeys.opportunities.inProgress();
      const onHoldKey = queryKeys.opportunities.onHold();
      const completedKey = queryKeys.opportunities.completed();

      [inProgressKey, onHoldKey, completedKey].forEach(key => {
        queryClient.setQueryData(key, (old: Opportunity[] = []) =>
          old.map((opp: Opportunity) => opp.id === opportunityId ? updatedOpportunity : opp)
        );
      });
    },
    onError: (error, { opportunityId }, context) => {
      // Rollback on error
      if (context) {
        context.keys.forEach((key, index) => {
          queryClient.setQueryData(key, context.previousData[index]);
        });
      }
      console.error('Failed to update role:', error);
    },
    onSettled: () => {
      // Always invalidate all opportunity caches after role update
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.inProgress() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.onHold() });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.completed() });
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
  const { 
    filters, 
    clientInput, 
    updateFilters, 
    updateClientInput, 
    updateGrades, 
    clearFilters, 
    hasActiveFilters,
    isFiltersValid,
    filterValidationErrors 
  } = useOpportunityFilters();
  const queries = useOpportunitiesQuery(filters);
  const createMutation = useCreateOpportunityMutation();
  const addRoleMutation = useAddRoleMutation();
  const moveMutation = useMoveOpportunityMutation();
  const updateMutation = useUpdateOpportunityMutation();
  const updateRoleStatusMutation = useUpdateRoleStatusMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const { filterOpportunities } = useOpportunityFiltering();

  return {
    ...queries,
    addOpportunity: createMutation.mutate,
    addRole: addRoleMutation.mutate,
    moveToOnHold: (opportunityId: string) => 
      moveMutation.mutate({ opportunityId, fromStatus: 'in-progress', toStatus: 'on-hold' }),
    moveToInProgress: (opportunityId: string) => 
      moveMutation.mutate({ opportunityId, fromStatus: 'on-hold', toStatus: 'in-progress' }),
    moveToCompleted: (opportunityId: string, fromStatus: 'in-progress' | 'on-hold') => 
      moveMutation.mutateAsync({ opportunityId, fromStatus, toStatus: 'completed' }),
    updateOpportunityInList: (opportunityId: string, updatedOpportunity: Opportunity, list: 'inProgress' | 'onHold') => 
      updateMutation.mutate({ 
        opportunityId, 
        updatedOpportunity, 
        listType: list === 'inProgress' ? 'in-progress' : 'on-hold' 
      }),
    updateRoleStatus: (opportunityId: string, roleId: string, status: string) =>
      updateRoleStatusMutation.mutateAsync({ opportunityId, roleId, status }),
    updateRole: (opportunityId: string, roleId: string, roleData: EditRoleForm) =>
      updateRoleMutation.mutate({ opportunityId, roleId, roleData }),
    
    // Filter-related state and functions
    filters,
    clientInput,
    updateFilters,
    updateClientInput,
    updateGrades,
    clearFilters,
    hasActiveFilters,
    isFiltersValid,
    filterValidationErrors,

    filterOpportunities,
    
    isCreating: createMutation.isPending,
    isAddingRole: addRoleMutation.isPending,
    isMoving: moveMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingRole: updateRoleStatusMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}; 
