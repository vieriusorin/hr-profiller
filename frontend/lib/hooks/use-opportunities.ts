import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, OpportunityListResponse, type CreateOpportunity, type UpdateOpportunity } from '@/lib/api-client';
import { Opportunity, OpportunityStatus } from '../types';

export const opportunityKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunityKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...opportunityKeys.lists(), { filters }] as const,
  details: () => [...opportunityKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunityKeys.details(), id] as const,
};

// Opportunity List Hook
export function useOpportunities(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: OpportunityStatus;
  client?: string;
  probability?: string;
  grades?: string;  // Comma-separated grades string (e.g., "JT,T,ST")
  needsHire?: 'yes' | 'no' | 'all';
}) {
  const normalizedParams = {
    page: params?.page || 1,
    limit: params?.limit || 10,
    search: params?.search || '',
    status: params?.status || '',
    client: params?.client || '',
    probability: params?.probability || '',
    grades: params?.grades || '',
    needsHire: params?.needsHire || '',
  };

  // Remove empty values to create cleaner query key
  const cleanParams = Object.entries(normalizedParams)
    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return useQuery({
    queryKey: opportunityKeys.list(cleanParams),
    queryFn: () => apiClient.opportunities.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => apiClient.opportunities.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInfiniteOpportunities(params?: {
  limit?: number;
  search?: string;
  status?: OpportunityStatus;
  client?: string;
  probability?: string;
  grades?: string;
  needsHire?: 'yes' | 'no' | 'all';
}) {
  const baseParams = {
    limit: params?.limit || 10,
    search: params?.search || '',
    status: params?.status || '',
    client: params?.client || '',
    probability: params?.probability || '',
    grades: params?.grades || '',
    needsHire: params?.needsHire || '',
  };

  const cleanParams = Object.entries(baseParams)
    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  console.log('🚀 useInfiniteOpportunities called with params:', params);
  console.log('🔧 baseParams:', baseParams);
  console.log('✨ cleanParams:', cleanParams);

  const query = useInfiniteQuery({
    queryKey: [...opportunityKeys.lists(), 'infinite', cleanParams],
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = {
        ...params,
        page: pageParam,
        limit: baseParams.limit,
      };

      try {
        const result = apiClient.opportunities.list(queryParams);
        return result;
      } catch (error) {
        console.error('❌ Error in queryFn:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      console.log('📄 getNextPageParam - lastPage:', lastPage);
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.nextPage;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (firstPage.pagination?.hasPreviousPage) {
        return firstPage.pagination.previousPage;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Force the query to be enabled
    retry: 3, // Add retry attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  console.log('🔍 Query State:', {
    status: query.status,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    data: query.data,
  });

  return query;
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunity) => apiClient.opportunities.create(data),
    onMutate: async (newOpportunity) => {
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: { data: Opportunity[] }) => {
        if (!old?.data) return old;
        const optimisticOpportunity = {
          id: `temp-${Date.now()}`,
          ...newOpportunity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          roles: [],
        };

        return {
          ...old,
          data: [optimisticOpportunity, ...old.data],
        };
      });

      return { previousOpportunities };
    },
    onError: (err, newOpportunity, context) => {
      if (context?.previousOpportunities) {
        context.previousOpportunities.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpportunity }) =>
      apiClient.opportunities.update(id, data),
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      await queryClient.cancelQueries({ queryKey: opportunityKeys.detail(id) });

      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      const previousOpportunity = queryClient.getQueryData(opportunityKeys.detail(id));

      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: OpportunityListResponse) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((opportunity: Opportunity) =>
            opportunity.id === id
              ? { ...opportunity, ...updateData, updatedAt: new Date().toISOString() }
              : opportunity
          ),
        };
      });

      queryClient.setQueryData(opportunityKeys.detail(id), (old: Opportunity) => {
        if (!old) return old;
        return {
          ...old,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousOpportunities, previousOpportunity };
    },
    onError: (err, { id }, context) => {
      if (context?.previousOpportunities) {
        context.previousOpportunities.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousOpportunity) {
        queryClient.setQueryData(opportunityKeys.detail(id), context.previousOpportunity);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(id) });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.opportunities.delete(id),
    onMutate: async (opportunityId) => {
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      await queryClient.cancelQueries({ queryKey: opportunityKeys.detail(opportunityId) });
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      const previousOpportunity = queryClient.getQueryData(opportunityKeys.detail(opportunityId));

      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: { data: Opportunity[] }) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.filter((opportunity: Opportunity) => opportunity.id !== opportunityId),
        };
      });

      queryClient.removeQueries({ queryKey: opportunityKeys.detail(opportunityId) });
      return { previousOpportunities, previousOpportunity, opportunityId };
    },
    onError: (err, opportunityId, context) => {
      if (context?.previousOpportunities) {
        context.previousOpportunities.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousOpportunity && context?.opportunityId) {
        queryClient.setQueryData(opportunityKeys.detail(context.opportunityId), context.previousOpportunity);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
} 