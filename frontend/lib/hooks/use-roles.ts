import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, Opportunity, RoleResponse, type CreateRole, type UpdateRole } from '@/lib/api-client';
import { opportunityKeys } from './use-opportunities';
import { JobGrade, RoleStatus } from '../backend-types/enums';

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

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

export function useRole(id: string, options?: Omit<UseQueryOptions<RoleResponse, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<RoleResponse, Error>({
    queryKey: roleKeys.detail(id),
    queryFn: () => apiClient.roles.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
    enabled: !!id && (options?.enabled ?? true),
  });
}

// Create Role Hook
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRole) => apiClient.roles.create(data),
    onMutate: async (newRole) => {
      await queryClient.cancelQueries({ queryKey: roleKeys.lists() });
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      const previousRoles = queryClient.getQueriesData({ queryKey: roleKeys.lists() });
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      const optimisticRole = {
        id: `temp-${Date.now()}`,
        ...newRole,
        status: 'Open' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueriesData({ queryKey: roleKeys.lists() }, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: [optimisticRole, ...old.data],
        };
      });
      if (newRole.opportunityId) {
        queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old: { data: Opportunity[] }) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: old.data.map((opportunity) => {
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

      return { previousRoles, previousOpportunities };
    },
    onError: (err, newRole, context) => {
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
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRole }) =>
      apiClient.roles.update(id, data),
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({ queryKey: roleKeys.lists() });
      await queryClient.cancelQueries({ queryKey: roleKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      const previousRoles = queryClient.getQueriesData({ queryKey: roleKeys.lists() });
      const previousRole = queryClient.getQueryData(roleKeys.detail(id));
      const previousOpportunities = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
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

      queryClient.setQueryData(roleKeys.detail(id), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
      });

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

      return { previousRoles, previousRole, previousOpportunities };
    },
    onError: (err, { id }, context) => {
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
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.roles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
} 