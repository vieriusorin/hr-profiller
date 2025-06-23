import type { components } from '@/types/api';
import { JobGrade, RoleStatus } from './backend-types/enums';

// Type-safe API client using generated OpenAPI types
type ApiComponents = components;

// Extract response types for easier usage
export type Employee = ApiComponents['schemas']['EmployeeProfile'];
export type Opportunity = ApiComponents['schemas']['Opportunity'];
export type Role = ApiComponents['schemas']['Role'];
export type CreateEmployee = ApiComponents['schemas']['CreateEmployee'];
export type UpdateEmployee = ApiComponents['schemas']['UpdateEmployee'];
export type CreateOpportunity = ApiComponents['schemas']['CreateOpportunity'];
export type UpdateOpportunity = ApiComponents['schemas']['UpdateOpportunity'];
export type CreateRole = ApiComponents['schemas']['CreateRole'];
export type UpdateRole = ApiComponents['schemas']['UpdateRole'];
export type EmployeeProfile = ApiComponents['schemas']['EmployeeProfile'];

// Response types
export type EmployeeResponse = {
  status: 'success';
  data: Employee;
  meta?: {
    timestamp: string;
  };
};

export type EmployeeListResponse = {
  status: 'success';
  data: Employee[];
  pagination?: PaginationMeta;
  meta?: {
    count: number;
    filtered: number;
    total: number;
    timestamp: string;
  };
};

export type OpportunityResponse = {
  status: 'success';
  data: Opportunity;
  meta?: {
    timestamp: string;
  };
};

export type OpportunityListResponse = {
  status: 'success';
  data: Opportunity[];
  pagination?: PaginationMeta;
  meta?: {
    count: number;
    filtered: number;
    total: number;
    timestamp: string;
  };
};

export type RoleResponse = {
  status: 'success';
  data: Role;
  meta?: {
    timestamp: string;
  };
};

export type RoleListResponse = {
  status: 'success';
  data: Role[];
  pagination?: PaginationMeta;
  meta?: {
    count: number;
    filtered: number;
    total: number;
    timestamp: string;
  };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
};

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  version: 'v1',
  timeout: 10000,
} as const;

// Build full API URL
const buildApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}/${cleanPath}`;
};

// Generic API error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with type safety
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, response.statusText, errorData);
    }

    // Handle empty responses (204 No Content, etc.)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Type-safe API methods
export const apiClient = {
  // Employee endpoints
  employees: {
    // GET /api/v1/employees
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      position?: string;
      employeeStatus?: 'Active' | 'On Leave' | 'Inactive';
      workStatus?: 'On Project' | 'On Bench' | 'Available';
      location?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          // Only append non-undefined, non-null, and non-empty string values
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return apiRequest<EmployeeListResponse>(
        `employees${query ? `?${query}` : ''}`
      );
    },

    // GET /api/v1/employees/{id}
    getById: (id: string) => {
      return apiRequest<EmployeeResponse>(`employees/${id}`);
    },

    // POST /api/v1/employees
    create: (data: CreateEmployee) => {
      return apiRequest<EmployeeResponse>('employees', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // PATCH /api/v1/employees/{id}
    update: (id: string, data: UpdateEmployee) => {
      return apiRequest<EmployeeResponse>(`employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    // DELETE /api/v1/employees/{id}
    delete: (id: string) => {
      return apiRequest<void>(`employees/${id}`, {
        method: 'DELETE',
      });
    },

    // POST /api/v1/employees/{id}/promote
    promote: (id: string, data: { newPosition: string; newSalary?: number }) => {
      return apiRequest<void>(`employees/${id}/promote`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // POST /api/v1/employees/{id}/terminate
    terminate: (id: string, data?: { endDate?: string; notes?: string }) => {
      return apiRequest<void>(`employees/${id}/terminate`, {
        method: 'POST',
        body: JSON.stringify(data || {}),
      });
    },

    // POST /api/v1/employees/{id}/assign-manager
    assignManager: (id: string, managerId: string) => {
      return apiRequest<void>(`employees/${id}/assign-manager`, {
        method: 'POST',
        body: JSON.stringify({ managerId }),
      });
    },

    // DELETE /api/v1/employees/{id}/remove-manager
    removeManager: (id: string) => {
      return apiRequest<void>(`employees/${id}/remove-manager`, {
        method: 'DELETE',
      });
    },
  },

  // Opportunity endpoints
  opportunities: {
    // GET /api/v1/opportunities
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: 'In Progress' | 'On Hold' | 'Done';
      client?: string;  // Changed from clientName to client to match backend API
      probability?: string;
      grades?: string;  // Comma-separated grades string (e.g., "JT,T,ST")
      needsHire?: 'yes' | 'no' | 'all';  // Hiring need filter
    }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          // Only append non-undefined, non-null, and non-empty string values
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      const result = apiRequest<OpportunityListResponse>(
        `opportunities${query ? `?${query}` : ''}`
      );
      
      result.then(response => {
        console.log('🔍 [Frontend API] Received opportunities response:', JSON.stringify(response.data[0], null, 2));
      });
      
      return result;
    },

    // GET /api/v1/opportunities/{id}
    getById: (id: string) => {
      return apiRequest<OpportunityResponse>(`opportunities/${id}`);
    },

    // POST /api/v1/opportunities
    create: (data: CreateOpportunity) => {
      return apiRequest<OpportunityResponse>('opportunities', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // PATCH /api/v1/opportunities/{id}
    update: (id: string, data: UpdateOpportunity) => {
      return apiRequest<OpportunityResponse>(`opportunities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    // DELETE /api/v1/opportunities/{id}
    delete: (id: string) => {
      return apiRequest<void>(`opportunities/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Role endpoints
  roles: {
    // GET /api/v1/roles
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: RoleStatus;
      jobGrade?: JobGrade;
      opportunityId?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          // Only append non-undefined, non-null, and non-empty string values
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }
      const query = searchParams.toString();
      return apiRequest<RoleListResponse>(
        `roles${query ? `?${query}` : ''}`
      );
    },

    // GET /api/v1/roles/{id}
    getById: (id: string) => {
      return apiRequest<RoleResponse>(`roles/${id}`);
    },

    // POST /api/v1/roles
    create: (data: CreateRole) => {
      return apiRequest<RoleResponse>('roles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // PATCH /api/v1/roles/{id}
    update: (id: string, data: UpdateRole) => {
      return apiRequest<RoleResponse>(`roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    // DELETE /api/v1/roles/{id}
    delete: (id: string) => {
      return apiRequest<void>(`roles/${id}`, {
        method: 'DELETE',
      });
    },

    // POST /api/v1/roles/{id}/assign-member
    assignMember: (roleId: string, personId: string) => {
      return apiRequest<{ status: string; message: string }>(`roles/${roleId}/assign-member`, {
        method: 'POST',
        body: JSON.stringify({ personId }),
      });
    },

    // POST /api/v1/roles/{id}/unassign-member
    unassignMember: (roleId: string, personId: string) => {
      return apiRequest<{ status: string; message: string }>(`roles/${roleId}/unassign-member`, {
        method: 'POST',
        body: JSON.stringify({ personId }),
      });
    },

    // PUT /api/v1/roles/{id}/assigned-members
    updateAssignedMembers: (roleId: string, personIds: string[]) => {
      return apiRequest<{ status: string; message: string }>(`roles/${roleId}/assigned-members`, {
        method: 'PUT',
        body: JSON.stringify({ personIds }),
      });
    },
  },
};

// Export types for use in components
export type ApiClient = typeof apiClient; 