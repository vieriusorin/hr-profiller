import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type CreateEmployee, type UpdateEmployee } from '@/lib/api-client';

// Query Keys
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...employeeKeys.lists(), { filters }] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// Employee List Hook
export function useEmployees(params?: {
  page?: number;
  limit?: number;
  search?: string;
  position?: string;
  employeeStatus?: 'Active' | 'On Leave' | 'Inactive';
  workStatus?: 'On Project' | 'On Bench' | 'Available';
  location?: string;
}) {
  return useQuery({
    queryKey: employeeKeys.list(params || {}),
    queryFn: () => apiClient.employees.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Employee Detail Hook
export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => apiClient.employees.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create Employee Hook
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployee) => apiClient.employees.create(data),
    onSuccess: () => {
      // Invalidate and refetch employee lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Update Employee Hook
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployee }) =>
      apiClient.employees.update(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch employee lists and detail
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

// Delete Employee Hook
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.employees.delete(id),
    onSuccess: () => {
      // Invalidate and refetch employee lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Promote Employee Hook
export function usePromoteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { newPosition: string; newSalary?: number } }) =>
      apiClient.employees.promote(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch employee lists and detail
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

// Terminate Employee Hook
export function useTerminateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { endDate?: string; notes?: string } }) =>
      apiClient.employees.terminate(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch employee lists and detail
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

// Assign Manager Hook
export function useAssignManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, managerId }: { id: string; managerId: string }) =>
      apiClient.employees.assignManager(id, managerId),
    onSuccess: (_, { id }) => {
      // Invalidate and refetch employee lists and detail
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

// Remove Manager Hook
export function useRemoveManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.employees.removeManager(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch employee lists and detail
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
} 