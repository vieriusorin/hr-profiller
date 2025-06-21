import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, type CreateOpportunity, type UpdateOpportunity } from '@/lib/api-client';

/**
 * Opportunity Hooks with Optimistic Updates and Cache Invalidation
 * 
 * This module provides TanStack Query hooks for opportunity operations with comprehensive
 * optimistic updates and cache invalidation strategies:
 * 
 * 1. CREATE OPPORTUNITY:
 *    - Optimistically adds opportunity to opportunity lists
 *    - Initializes with empty roles array (roles added separately)
 *    - Invalidates opportunity caches on success
 * 
 * 2. UPDATE OPPORTUNITY:
 *    - Optimistically updates opportunity in lists and detail views
 *    - Handles status changes (In Progress -> On Hold -> Done) seamlessly
 *    - Invalidates opportunity caches on success
 * 
 * 3. DELETE OPPORTUNITY:
 *    - Optimistically removes opportunity from lists
 *    - Removes opportunity detail from cache
 *    - Invalidates opportunity caches on success
 * 
 * All mutations include proper rollback mechanisms in case of errors.
 * When roles are added/updated, those hooks also invalidate opportunity caches
 * since roles are dynamically attached to opportunities by the backend.
 */

// Query Keys
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
  status?: 'In Progress' | 'On Hold' | 'Done';
  client?: string;  // Changed from clientName to client to match backend API
  probability?: string;
  grades?: string;  // Comma-separated grades string (e.g., "JT,T,ST")
  needsHire?: 'yes' | 'no' | 'all';  // Hiring need filter
}) {
  // Normalize params to ensure consistent query keys
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

  console.log('🔑 TanStack Query Key:', opportunityKeys.list(cleanParams));
  console.log('📋 API Parameters:', params);

  return useQuery({
    queryKey: opportunityKeys.list(cleanParams),
    queryFn: () => apiClient.opportunities.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Opportunity Detail Hook
export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => apiClient.opportunities.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Infinite Opportunities Hook for pagination/infinite scroll
export function useInfiniteOpportunities(params?: {
  limit?: number;
  search?: string;
  status?: 'In Progress' | 'On Hold' | 'Done';
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

  // Remove empty values to create cleaner query key
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
      console.log('📡 Making API call with queryParams:', queryParams);
      console.log('🌐 API URL should be:', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/opportunities`);

      try {
        const result = apiClient.opportunities.list(queryParams);
        console.log('🎯 API call initiated, result:', result);
        return result;
      } catch (error) {
        console.error('❌ Error in queryFn:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      console.log('📄 getNextPageParam - lastPage:', lastPage);
      // Check if there's a next page based on the pagination metadata
      if (lastPage.pagination?.hasNextPage) {
        return lastPage.pagination.nextPage;
      }
      return undefined;
    },
    getPreviousPageParam: (firstPage) => {
      // Check if there's a previous page
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

// Create Opportunity Hook
export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunity) => apiClient.opportunities.create(data),
    // Optimistic update - immediately show the new opportunity
    onMutate: async (newOpportunity) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });

      // Snapshot the previous values
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });

      // Optimistically update opportunity lists
      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: any) => {
        if (!old?.data) return old;

        // Create optimistic opportunity with temporary ID
        const optimisticOpportunity = {
          id: `temp-${Date.now()}`,
          ...newOpportunity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Initialize with empty roles array (will be populated when roles are added)
          roles: [],
        };

        return {
          ...old,
          data: [optimisticOpportunity, ...old.data],
        };
      });

      // Return context for potential rollback
      return { previousOpportunities };
    },
    onError: (err, newOpportunity, context) => {
      // If mutation fails, rollback optimistic updates
      if (context?.previousOpportunities) {
        context.previousOpportunities.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

// Update Opportunity Hook
export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpportunity }) =>
      apiClient.opportunities.update(id, data),
    // Optimistic update - immediately show the updated opportunity
    onMutate: async ({ id, data: updateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      await queryClient.cancelQueries({ queryKey: opportunityKeys.detail(id) });

      // Snapshot the previous values
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      const previousOpportunity = queryClient.getQueryData(opportunityKeys.detail(id));

      // Optimistically update opportunity lists
      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((opportunity: any) =>
            opportunity.id === id
              ? { ...opportunity, ...updateData, updatedAt: new Date().toISOString() }
              : opportunity
          ),
        };
      });

      // Optimistically update opportunity detail
      queryClient.setQueryData(opportunityKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
      });

      // Return context for potential rollback
      return { previousOpportunities, previousOpportunity };
    },
    onError: (err, { id }, context) => {
      // If mutation fails, rollback optimistic updates
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
      // Invalidate and refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(id) });
    },
  });
}

// Delete Opportunity Hook
export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.opportunities.delete(id),
    // Optimistic update - immediately remove the opportunity from the UI
    onMutate: async (opportunityId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      await queryClient.cancelQueries({ queryKey: opportunityKeys.detail(opportunityId) });

      // Snapshot the previous values
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      const previousOpportunity = queryClient.getQueryData(opportunityKeys.detail(opportunityId));

      // Optimistically remove opportunity from lists
      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.filter((opportunity: any) => opportunity.id !== opportunityId),
        };
      });

      // Remove opportunity detail from cache
      queryClient.removeQueries({ queryKey: opportunityKeys.detail(opportunityId) });

      // Return context for potential rollback
      return { previousOpportunities, previousOpportunity, opportunityId };
    },
    onError: (err, opportunityId, context) => {
      // If mutation fails, rollback optimistic updates
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
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
} 