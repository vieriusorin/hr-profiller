import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type CreateEmployee, type UpdateEmployee } from '@/lib/api-client';
import { EmployeeStatus, WorkStatus } from '../types';

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
  employeeStatus?: EmployeeStatus;
  workStatus?: WorkStatus;
  location?: string;
}) {
  return useQuery({
    queryKey: employeeKeys.list(params || {}),
    queryFn: () => apiClient.employees.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => apiClient.employees.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployee) => apiClient.employees.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployee }) =>
      apiClient.employees.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.employees.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function usePromoteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { newPosition: string; newSalary?: number } }) =>
      apiClient.employees.promote(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useTerminateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { endDate?: string; notes?: string } }) =>
      apiClient.employees.terminate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useAssignManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, managerId }: { id: string; managerId: string }) =>
      apiClient.employees.assignManager(id, managerId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useRemoveManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.employees.removeManager(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
} 