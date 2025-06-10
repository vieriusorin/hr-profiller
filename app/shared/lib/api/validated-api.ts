import { 
  validateOpportunities, 
  validateOpportunity, 
  safeParseOpportunities,
  OpportunitySchema,
  CreateOpportunityInputSchema,
  CreateRoleInputSchema,
  type Opportunity,
  type CreateOpportunityInput,
  type CreateRoleInput
} from '../../schemas/api-schemas';
import { opportunityApi } from './mock-data';
import { z } from 'zod';

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
  async getInProgressOpportunities(): Promise<ValidatedApiResult<Opportunity[]>> {
    try {
      const rawData = await opportunityApi.getInProgressOpportunities();
      const validation = validateOpportunities(rawData);
      
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
      };
    }
  },

  async getOnHoldOpportunities(): Promise<ValidatedApiResult<Opportunity[]>> {
    try {
      const rawData = await opportunityApi.getOnHoldOpportunities();
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
      };
    }
  },

  async getCompletedOpportunities(): Promise<ValidatedApiResult<Opportunity[]>> {
    try {
      const rawData = await opportunityApi.getCompletedOpportunities();
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
      };
    }
  },

  async createOpportunity(input: CreateOpportunityInput): Promise<ValidatedApiResult<Opportunity>> {
    try {
      // Validate input first
      const validatedInput = CreateOpportunityInputSchema.parse(input);
      
      // Call the API with validated input
      const rawData = await opportunityApi.createOpportunity(validatedInput as any);
      
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
    opportunityId: number, 
    roleData: CreateRoleInput
  ): Promise<ValidatedApiResult<Opportunity>> {
    try {
      // Validate input
      const validatedRoleData = CreateRoleInputSchema.parse(roleData);
      
      // Call the API
      const rawData = await opportunityApi.addRoleToOpportunity(opportunityId, validatedRoleData);
      
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

  async updateOpportunity(opportunity: Opportunity): Promise<ValidatedApiResult<Opportunity>> {
    try {
      // Validate input
      const validatedOpportunity = OpportunitySchema.parse(opportunity);
      
      // Call the API
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
    opportunityId: number, 
    toStatus: 'In Progress' | 'On Hold' | 'Done'
  ): Promise<ValidatedApiResult<Opportunity>> {
    try {
      const rawData = await opportunityApi.moveOpportunity(opportunityId, toStatus);
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
    opportunityId: number,
    roleId: number,
    status: string
  ): Promise<ValidatedApiResult<Opportunity>> {
    try {
      const rawData = await opportunityApi.updateRoleStatus(opportunityId, roleId, status);
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
}; 