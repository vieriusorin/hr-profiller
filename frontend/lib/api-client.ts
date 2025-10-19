import type { components } from '@/types/api';
import { JobGrade, RoleStatus } from './backend-types/enums';
import { getSession } from 'next-auth/react';

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

// Helper function to refresh backend token
async function refreshBackendToken(session: any): Promise<string | null> {
  try {
    console.log('Attempting to refresh backend token...');
    
    if (!session.user?.email) {
      console.error('No user email found for token refresh');
      return null;
    }

    // Use the refresh token endpoint
    const refreshResponse = await fetch(`${API_CONFIG.baseUrl}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: session.backendToken,
        expiresIn: '24h',
        clientId: 'user-session'
      }),
    });

    if (!refreshResponse.ok) {
      console.error('Token refresh failed:', refreshResponse.status);
      return null;
    }

    const refreshData = await refreshResponse.json();
    if (refreshData.success && refreshData.data?.token) {
      console.log('Backend token refreshed successfully');
      return refreshData.data.token;
    }

    return null;
  } catch (error) {
    console.error('Error refreshing backend token:', error);
    return null;
  }
}

// Generic fetch wrapper with type safety and token refresh
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);

  let session = await getSession();

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };


  if (session && (session as any).backendToken) {
    defaultHeaders['Authorization'] = `Bearer ${(session as any).backendToken}`;
  } else {
    console.warn('No backend token found in session for API request');
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // If we get a 403 and it might be due to token expiry, try to refresh
    if (response.status === 403 && session && (session as any).backendToken) {
      console.log('Got 403, attempting token refresh...');
      
      const newToken = await refreshBackendToken(session);
      if (newToken) {
        // Update the session (note: this won't persist across page reloads)
        (session as any).backendToken = newToken;
        
        // Retry the request with the new token
        const retryConfig: RequestInit = {
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        };
        
        console.log('Retrying request with refreshed token...');
        const retryResponse = await fetch(url, retryConfig);
        
        if (retryResponse.ok) {
          if (retryResponse.status === 204) {
            return {} as T;
          }
          return await retryResponse.json();
        }
      }
      
      // If refresh failed or retry failed, continue with original error
      console.error('Token refresh failed or retry failed');
    }

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
      return apiRequest<{ status: 'success'; message: string }>(`roles/${roleId}/assign-member`, {
        method: 'POST',
        body: JSON.stringify({ personId }),
      });
    },

    // POST /api/v1/roles/{id}/unassign-member
    unassignMember: (roleId: string, personId: string) => {
      return apiRequest<{ status: 'success'; message: string }>(`roles/${roleId}/unassign-member`, {
        method: 'POST',
        body: JSON.stringify({ personId }),
      });
    },

    // POST /api/v1/roles/{id}/assigned-members
    updateAssignedMembers: (roleId: string, personIds: string[]) => {
      return apiRequest<{ status: 'success'; message: string }>(`roles/${roleId}/assigned-members`, {
        method: 'POST',
        body: JSON.stringify({ personIds }),
      });
    },
  },
};

// Export types for use in components
export type ApiClient = typeof apiClient; 