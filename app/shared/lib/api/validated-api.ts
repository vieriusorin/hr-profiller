import { Opportunity, OpportunityFilters } from '@/shared/types';
import {
  OpportunitySchema,
  type Opportunity as OpportunityType,
  validateOpportunities,
  safeParseOpportunities,
  CreateOpportunityInputSchema,
  CreateRoleInputSchema,
  validateOpportunity,
  type CreateOpportunityInput,
  type CreateRoleInput,
  EditRoleFormSchema
} from '@/shared/schemas/api-schemas';
import { z } from 'zod';

const API_BASE_URL = '/api';

// Helper to build query strings
const buildQueryString = (filters: OpportunityFilters): string => {
  const params = new URLSearchParams();
  if (filters.client) params.append('client', filters.client);
  if (filters.grades && filters.grades.length > 0) params.append('grades', filters.grades.join(','));
  if (filters.needsHire) params.append('needsHire', filters.needsHire);
  if (filters.probability) params.append('probability', filters.probability.join('-'));
  return params.toString();
}

export const opportunityApi = {
  async getInProgressOpportunities(filters: OpportunityFilters): Promise<Opportunity[]> {
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/opportunities/in-progress?${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch in-progress opportunities');
    return await response.json();
  },

  async getOnHoldOpportunities(filters: OpportunityFilters): Promise<Opportunity[]> {
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/opportunities/on-hold?${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch on-hold opportunities');
    return await response.json();
  },

  async getCompletedOpportunities(filters: OpportunityFilters): Promise<Opportunity[]> {
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/opportunities/completed?${queryString}`);
    if (!response.ok) throw new Error('Failed to fetch completed opportunities');
    return await response.json();
  },

  async createOpportunity(opportunity: Partial<Opportunity>): Promise<Opportunity> {
    const response = await fetch(`${API_BASE_URL}/opportunities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity),
    });
    if (!response.ok) throw new Error('Failed to create opportunity');
    return await response.json();
  },

  async addRoleToOpportunity(opportunityId: string, roleData: CreateRoleInput): Promise<Opportunity> {
    const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/roles`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData),
    });
    if (!response.ok) throw new Error('Failed to add role');
    return await response.json();
  },

  async updateOpportunity(opportunity: Opportunity): Promise<Opportunity> {
    const response = await fetch(`${API_BASE_URL}/opportunities/${opportunity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity),
    });
    if (!response.ok) throw new Error('Failed to update opportunity');
    return await response.json();
  },

  async moveOpportunity(opportunityId: string, toStatus: 'In Progress' | 'On Hold' | 'Done'): Promise<Opportunity> {
    const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toStatus }),
    });
    if (!response.ok) throw new Error('Failed to move opportunity');
    return await response.json();
  },

  async updateRoleStatus(opportunityId: string, roleId: string, status: string): Promise<Opportunity> {
    const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/roles/${roleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update role status');
    return await response.json();
  },

  async updateRole(opportunityId: string, roleId: string, roleData: EditRoleForm): Promise<Opportunity> {
    const response = await fetch(`${API_BASE_URL}/opportunities/${opportunityId}/roles/${roleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData),
    });
    if (!response.ok) throw new Error('Failed to update role');
    return await response.json();
  }
}

// Enhanced error class for API validation errors
export class ApiValidationError extends Error {
  constructor(
    public originalError: z.ZodError,
    public endpoint: string,
    public data: unknown
  ) {
    super(`Validation failed for ${endpoint}: ${originalError.message}`);
    this.name = 'ApiValidationError';
  }

  getFormattedErrors() {
    return this.originalError.format();
  }

  getErrorsForField(field: string) {
    return this.originalError.formErrors.fieldErrors[field] || [];
  }
}

// Result type for validated API calls
export type ValidatedApiResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiValidationError | Error;
  fallbackData?: T;
};

// Validated API wrapper
export const validatedOpportunityApi = {
  async getInProgressOpportunities(filters: OpportunityFilters): Promise<ValidatedApiResult<OpportunityType[]>> {
    try {
      const rawData = await opportunityApi.getInProgressOpportunities(filters);

      if (!Array.isArray(rawData)) {
        console.error('API returned non-array data for getInProgressOpportunities:', rawData);
        const customError = new Error('Invalid data format from API: expected an array.');
        return { success: false, error: customError, fallbackData: [] };
      }

      const validation = validateOpportunities(rawData);

      console.log('validation', validation);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      // Use safe parsing as fallback
      const fallbackData = safeParseOpportunities(rawData);

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'getInProgressOpportunities', rawData),
        fallbackData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        fallbackData: [],
      };
    }
  },

  async getOnHoldOpportunities(filters: OpportunityFilters): Promise<ValidatedApiResult<OpportunityType[]>> {
    try {
      const rawData = await opportunityApi.getOnHoldOpportunities(filters);

      if (!Array.isArray(rawData)) {
        console.error('API returned non-array data for getOnHoldOpportunities:', rawData);
        const customError = new Error('Invalid data format from API: expected an array.');
        return { success: false, error: customError, fallbackData: [] };
      }

      const validation = validateOpportunities(rawData);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      const fallbackData = safeParseOpportunities(rawData);

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'getOnHoldOpportunities', rawData),
        fallbackData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        fallbackData: [],
      };
    }
  },

  async getCompletedOpportunities(filters: OpportunityFilters): Promise<ValidatedApiResult<OpportunityType[]>> {
    try {
      const rawData = await opportunityApi.getCompletedOpportunities(filters);

      if (!Array.isArray(rawData)) {
        console.error('API returned non-array data for getCompletedOpportunities:', rawData);
        const customError = new Error('Invalid data format from API: expected an array.');
        return { success: false, error: customError, fallbackData: [] };
      }

      const validation = validateOpportunities(rawData);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      const fallbackData = safeParseOpportunities(rawData);

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'getCompletedOpportunities', rawData),
        fallbackData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        fallbackData: [],
      };
    }
  },

  async createOpportunity(input: CreateOpportunityInput): Promise<ValidatedApiResult<OpportunityType>> {
    try {
      // Validate input first
      const validatedInput = CreateOpportunityInputSchema.parse(input);

      // Call the API with validated input
      const rawData = await opportunityApi.createOpportunity(validatedInput as unknown as Opportunity);

      // Validate the response
      const validation = validateOpportunity(rawData);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'createOpportunity', rawData),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: new ApiValidationError(error, 'createOpportunity', input),
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  },

  async addRoleToOpportunity(
    opportunityId: string,
    roleData: CreateRoleInput
  ): Promise<ValidatedApiResult<OpportunityType>> {
    try {
      // Validate input
      const validatedRoleData = CreateRoleInputSchema.parse(roleData);

      // Call the API
      const rawData = await opportunityApi.addRoleToOpportunity(opportunityId, validatedRoleData);

      // Validate the response
      const validation = validateOpportunity(rawData);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'addRoleToOpportunity', rawData),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: new ApiValidationError(error, 'addRoleToOpportunity', roleData),
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  },

  async updateOpportunity(opportunity: OpportunityType): Promise<ValidatedApiResult<OpportunityType>> {
    try {
      // Validate input
      const validatedOpportunity = OpportunitySchema.parse(opportunity);

      // Call API
      const rawData = await opportunityApi.updateOpportunity(validatedOpportunity);

      // Validate response
      const validation = validateOpportunity(rawData);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'updateOpportunity', rawData),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: new ApiValidationError(error, 'updateOpportunity', opportunity),
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  },

  async moveOpportunity(
    opportunityId: string,
    toStatus: 'In Progress' | 'On Hold' | 'Done'
  ): Promise<ValidatedApiResult<OpportunityType>> {
    try {
      const rawData = await opportunityApi.moveOpportunity(opportunityId, toStatus);

      // Validate the response
      const validation = validateOpportunity(rawData);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'moveOpportunity', rawData),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  },

  async updateRoleStatus(
    opportunityId: string,
    roleId: string,
    status: string
  ): Promise<ValidatedApiResult<OpportunityType>> {
    try {
      const rawData = await opportunityApi.updateRoleStatus(opportunityId, roleId, status);

      // Validate the response
      const validation = validateOpportunity(rawData);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'updateRoleStatus', rawData),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  },

  async updateRole(
    opportunityId: string,
    roleId: string,
    roleData: EditRoleForm
  ): Promise<ValidatedApiResult<OpportunityType>> {
    try {
      // Validate input
      const validatedRoleData = EditRoleFormSchema.parse(roleData);

      // Call the API
      const rawData = await opportunityApi.updateRole(opportunityId, roleId, validatedRoleData);

      // Validate the response
      const validation = validateOpportunity(rawData);

      if (validation.success) {
        return {
          success: true,
          data: validation.data,
        };
      }

      return {
        success: false,
        error: new ApiValidationError(validation.error, 'updateRole', rawData),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: new ApiValidationError(error, 'updateRole', roleData),
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }
}; 
