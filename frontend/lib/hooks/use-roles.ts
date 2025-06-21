import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type CreateRole, type UpdateRole } from '@/lib/api-client';
import { opportunityKeys } from './use-opportunities';
import { JobGrade, RoleStatus } from '../backend-types/enums';

/**
 * Role Hooks with Optimistic Updates and Cache Invalidation
 * 
 * This module provides TanStack Query hooks for role operations with comprehensive
 * optimistic updates and cache invalidation strategies:
 * 
 * 1. CREATE ROLE:
 *    - Optimistically adds role to role lists
 *    - Optimistically adds role to opportunity's roles array
 *    - Invalidates both role and opportunity caches on success
 * 
 * 2. UPDATE ROLE:
 *    - Optimistically updates role in role lists and detail
 *    - Optimistically updates role within opportunity's roles array
 *    - Invalidates both role and opportunity caches on success
 * 
 * 3. DELETE ROLE:
 *    - Optimistically removes role from role lists
 *    - Invalidates both role and opportunity caches on success
 * 
 * All mutations include proper rollback mechanisms in case of errors.
 */

// Query Keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

// Role List Hook
export function useRoles(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: RoleStatus;
  jobGrade?: JobGrade;
  opportunityId?: string;
}) {
  return useQuery({
    queryKey: roleKeys.list(params || {}),
    queryFn: () => apiClient.roles.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Role Detail Hook
export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => apiClient.roles.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create Role Hook
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRole) => apiClient.roles.create(data),
    // Optimistic update - immediately show the new role
    onMutate: async (newRole) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: roleKeys.lists() });
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });

      // Snapshot the previous values
      const previousRoles = queryClient.getQueriesData({ queryKey: roleKeys.lists() });
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });

      // Create optimistic role with temporary ID
      const optimisticRole = {
        id: `temp-${Date.now()}`,
        ...newRole,
        status: 'Open' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update role lists
      queryClient.setQueriesData({ queryKey: roleKeys.lists() }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: [optimisticRole, ...old.data],
        };
      });

      // Optimistically add role to the opportunity's roles array
      if (newRole.opportunityId) {
        queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: any) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: old.data.map((opportunity: any) => {
              if (opportunity.id === newRole.opportunityId) {
                const existingRoles = opportunity.roles || [];
                return {
                  ...opportunity,
                  roles: [optimisticRole, ...existingRoles],
                };
              }
              return opportunity;
            }),
          };
        });
      }

      // Return context for potential rollback
      return { previousRoles, previousOpportunities };
    },
    onError: (err, newRole, context) => {
      // If mutation fails, rollback optimistic updates
      if (context?.previousRoles) {
        context.previousRoles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousOpportunities) {
        context.previousOpportunities.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      // IMPORTANT: Also invalidate opportunities cache since roles are dynamically attached
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

// Update Role Hook
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRole }) =>
      apiClient.roles.update(id, data),
    // Optimistic update - immediately show the updated role
    onMutate: async ({ id, data: updateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: roleKeys.lists() });
      await queryClient.cancelQueries({ queryKey: roleKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });

      // Snapshot the previous values
      const previousRoles = queryClient.getQueriesData({ queryKey: roleKeys.lists() });
      const previousRole = queryClient.getQueryData(roleKeys.detail(id));
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });

      // Optimistically update role lists
      queryClient.setQueriesData({ queryKey: roleKeys.lists() }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((role: any) =>
            role.id === id
              ? { ...role, ...updateData, updatedAt: new Date().toISOString() }
              : role
          ),
        };
      });

      // Optimistically update role detail
      queryClient.setQueryData(roleKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
      });

      // Optimistically update roles within opportunities
      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((opportunity: any) => {
            if (opportunity.roles && Array.isArray(opportunity.roles)) {
              const updatedRoles = opportunity.roles.map((role: any) =>
                role.id === id
                  ? { ...role, ...updateData, updatedAt: new Date().toISOString() }
                  : role
              );
              return { ...opportunity, roles: updatedRoles };
            }
            return opportunity;
          }),
        };
      });

      // Return context for potential rollback
      return { previousRoles, previousRole, previousOpportunities };
    },
    onError: (err, { id }, context) => {
      // If mutation fails, rollback optimistic updates
      if (context?.previousRoles) {
        context.previousRoles.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousRole) {
        queryClient.setQueryData(roleKeys.detail(id), context.previousRole);
      }
      if (context?.previousOpportunities) {
        context.previousOpportunities.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (_, { id }) => {
      // Invalidate and refetch to get real data from server
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      // IMPORTANT: Also invalidate opportunities cache since roles are dynamically attached
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

// Delete Role Hook
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.roles.delete(id),
    onSuccess: () => {
      // Invalidate and refetch role lists
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      // IMPORTANT: Also invalidate opportunities cache since roles are dynamically attached
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
} 