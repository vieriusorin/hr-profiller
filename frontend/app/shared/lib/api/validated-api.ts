/**
 * Validated API Module
 * 
 * This module provides type-safe API clients with validation error handling.
 * It wraps regular API calls to provide graceful error handling and fallback data.
 */

import { z } from 'zod';
import { apiClient } from '@/lib/api-client';
import { Opportunity, OpportunityFilters } from '@/lib/types';

// ===== TYPES AND INTERFACES =====

/**
 * Enhanced API Validation Error class
 * Extends the standard Error class with validation-specific features
 */
export class ApiValidationError extends Error {
  public readonly endpoint: string;
  public readonly status?: number;
  public readonly statusText?: string;
  public readonly validationErrors?: ValidationErrorDetails;
  public readonly originalError?: Error;

  constructor(
    message: string,
    endpoint: string,
    options: {
      status?: number;
      statusText?: string;
      validationErrors?: ValidationErrorDetails;
      originalError?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'ApiValidationError';
    this.endpoint = endpoint;
    this.status = options.status;
    this.statusText = options.statusText;
    this.validationErrors = options.validationErrors;
    this.originalError = options.originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiValidationError);
    }
  }

  /**
   * Get formatted validation errors for display
   */
  getFormattedErrors(): FormattedValidationErrors {
    if (!this.validationErrors) {
      return {
        _errors: [this.message],
      };
    }

    const formatted: FormattedValidationErrors = {};

    // Handle general errors
    if (this.validationErrors._errors && this.validationErrors._errors.length > 0) {
      formatted._errors = this.validationErrors._errors;
    }

    // Handle field-specific errors
    Object.entries(this.validationErrors).forEach(([field, fieldErrors]) => {
      if (field === '_errors') return;

      if (Array.isArray(fieldErrors)) {
        formatted[field] = fieldErrors;
      } else if (fieldErrors && typeof fieldErrors === 'object' && 'errors' in fieldErrors) {
        formatted[field] = (fieldErrors as { errors: string[] }).errors;
      } else if (typeof fieldErrors === 'string') {
        formatted[field] = [fieldErrors];
      }
    });

    return formatted;
  }

  /**
   * Check if this is a client-side validation error (4xx)
   */
  isClientError(): boolean {
    return this.status ? this.status >= 400 && this.status < 500 : false;
  }

  /**
   * Check if this is a server-side error (5xx)
   */
  isServerError(): boolean {
    return this.status ? this.status >= 500 : false;
  }

  /**
   * Get a user-friendly error message
   */
  getUserFriendlyMessage(): string {
    if (this.isServerError()) {
      return 'Server error occurred. Please try again later.';
    }

    if (this.isClientError()) {
      return `Validation failed for ${this.endpoint}`;
    }

    return this.message;
  }
}

/**
 * Validation error details structure
 */
export interface ValidationErrorDetails {
  _errors?: string[];
  [field: string]: string[] | { errors: string[] } | string | undefined;
}

/**
 * Formatted validation errors for display
 */
export interface FormattedValidationErrors {
  _errors?: string[];
  [field: string]: string[] | undefined;
}

/**
 * Result type for validated API calls
 */
export type ValidatedApiResult<T> =
  | {
    success: true;
    data: T;
    error: null;
    fallbackData?: T;
  }
  | {
    success: false;
    data?: never;
    error: ApiValidationError;
    fallbackData?: T;
  };

// ===== VALIDATION SCHEMAS =====

/**
 * Zod schema for validating opportunity data
 */
const OpportunitySchema = z.object({
  id: z.string().uuid(),
  opportunityName: z.string().min(1),
  clientId: z.string().uuid().nullable(),
  clientName: z.string().nullable(),
  expectedStartDate: z.string().datetime().nullable(),
  expectedEndDate: z.string().datetime().nullable(),
  probability: z.number().min(0).max(100).nullable(),
  status: z.enum(['In Progress', 'On Hold', 'Done']),
  comment: z.string().nullable(),
  isActive: z.boolean().nullable(),
  activatedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  roles: z.array(z.any()).optional().default([]),
});

const OpportunityArraySchema = z.array(OpportunitySchema);

// ===== UTILITY FUNCTIONS =====

/**
 * Safely parse and validate opportunity data
 */
function validateOpportunityData(data: unknown, endpoint: string): Opportunity[] {
  try {
    const result = OpportunityArraySchema.parse(data);
    return result as Opportunity[];
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationErrorDetails = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        (validationErrors[path] as string[]).push(err.message);
      });

      throw new ApiValidationError(
        `Validation failed for ${endpoint}`,
        endpoint,
        {
          validationErrors,
          originalError: error as Error,
        }
      );
    }

    throw new ApiValidationError(
      `Failed to parse data from ${endpoint}`,
      endpoint,
      {
        originalError: error as Error,
      }
    );
  }
}

/**
 * Safely parse and validate single opportunity data
 */
function validateSingleOpportunityData(data: unknown, endpoint: string): Opportunity {
  try {
    const result = OpportunitySchema.parse(data);
    return result as Opportunity;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: ValidationErrorDetails = {};

      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        (validationErrors[path] as string[]).push(err.message);
      });

      throw new ApiValidationError(
        `Validation failed for ${endpoint}`,
        endpoint,
        {
          validationErrors,
          originalError: error as Error,
        }
      );
    }

    throw new ApiValidationError(
      `Failed to parse data from ${endpoint}`,
      endpoint,
      {
        originalError: error as Error,
      }
    );
  }
}

/**
 * Attempt to salvage partial data from validation errors
 */
function salvagePartialData(data: unknown): Opportunity[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const salvaged: Opportunity[] = [];

  data.forEach((item, index) => {
    try {
      const validated = OpportunitySchema.parse(item);
      salvaged.push(validated as Opportunity);
    } catch (error) {
      console.warn(`Skipping invalid opportunity at index ${index}:`, error);
    }
  });

  return salvaged;
}

// ===== VALIDATED API CLIENT =====

/**
 * Validated Opportunity API Client
 * Provides type-safe API calls with validation error handling
 */
export const validatedOpportunityApi = {
  /**
   * Get in-progress opportunities with validation
   */
  async getInProgressOpportunities(
    filters: OpportunityFilters = { client: '', grades: [], needsHire: 'all', probability: [0, 100] }
  ): Promise<ValidatedApiResult<Opportunity[]>> {
    const endpoint = '/api/v1/opportunities?status=In Progress';

    try {
      // Call the regular API client using the correct method name
      const response = await apiClient.opportunities.list({
        status: 'In Progress',
        client: filters.client || undefined,
        probability: filters.probability?.[0] !== 0 || filters.probability?.[1] !== 100
          ? `${filters.probability[0]}-${filters.probability[1]}`
          : undefined,
      });

      const validatedData = validateOpportunityData(response.data, endpoint);

      return {
        success: true,
        data: validatedData,
        error: null,
      };
    } catch (error) {
      if (error instanceof ApiValidationError) {
        // Try to salvage partial data
        const fallbackData = salvagePartialData((error.originalError as any)?.response?.data?.data);

        return {
          success: false,
          error,
          fallbackData: fallbackData.length > 0 ? fallbackData : undefined,
        };
      }

      // Convert other errors to ApiValidationError
      const apiError = new ApiValidationError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        endpoint,
        {
          originalError: error as Error,
          status: (error as any)?.response?.status,
          statusText: (error as any)?.response?.statusText,
        }
      );

      return {
        success: false,
        error: apiError,
      };
    }
  },

  /**
   * Get on-hold opportunities with validation
   */
  async getOnHoldOpportunities(
    filters: OpportunityFilters = { client: '', grades: [], needsHire: 'all', probability: [0, 100] }
  ): Promise<ValidatedApiResult<Opportunity[]>> {
    const endpoint = '/api/v1/opportunities?status=On Hold';

    try {
      const response = await apiClient.opportunities.list({
        status: 'On Hold',
        client: filters.client || undefined,
        probability: filters.probability?.[0] !== 0 || filters.probability?.[1] !== 100
          ? `${filters.probability[0]}-${filters.probability[1]}`
          : undefined,
      });

      const validatedData = validateOpportunityData(response.data, endpoint);

      return {
        success: true,
        data: validatedData,
        error: null,
      };
    } catch (error) {
      if (error instanceof ApiValidationError) {
        const fallbackData = salvagePartialData((error.originalError as any)?.response?.data?.data);

        return {
          success: false,
          error,
          fallbackData: fallbackData.length > 0 ? fallbackData : undefined,
        };
      }

      const apiError = new ApiValidationError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        endpoint,
        {
          originalError: error as Error,
          status: (error as any)?.response?.status,
          statusText: (error as any)?.response?.statusText,
        }
      );

      return {
        success: false,
        error: apiError,
      };
    }
  },

  /**
   * Get completed opportunities with validation
   */
  async getCompletedOpportunities(
    filters: OpportunityFilters = { client: '', grades: [], needsHire: 'all', probability: [0, 100] }
  ): Promise<ValidatedApiResult<Opportunity[]>> {
    const endpoint = '/api/v1/opportunities?status=Done';

    try {
      const response = await apiClient.opportunities.list({
        status: 'Done',
        client: filters.client || undefined,
        probability: filters.probability?.[0] !== 0 || filters.probability?.[1] !== 100
          ? `${filters.probability[0]}-${filters.probability[1]}`
          : undefined,
      });

      const validatedData = validateOpportunityData(response.data, endpoint);

      return {
        success: true,
        data: validatedData,
        error: null,
      };
    } catch (error) {
      if (error instanceof ApiValidationError) {
        const fallbackData = salvagePartialData((error.originalError as any)?.response?.data?.data);

        return {
          success: false,
          error,
          fallbackData: fallbackData.length > 0 ? fallbackData : undefined,
        };
      }

      const apiError = new ApiValidationError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        endpoint,
        {
          originalError: error as Error,
          status: (error as any)?.response?.status,
          statusText: (error as any)?.response?.statusText,
        }
      );

      return {
        success: false,
        error: apiError,
      };
    }
  },

  /**
   * Create a new opportunity with validation
   */
  async createOpportunity(
    opportunityData: {
      opportunityName: string;
      clientName: string;
      expectedStartDate: string;
      probability: number;
      createdAt: string;
    }
  ): Promise<ValidatedApiResult<Opportunity>> {
    const endpoint = '/api/v1/opportunities';

    try {
      const response = await apiClient.opportunities.create({
        opportunityName: opportunityData.opportunityName,
        clientName: opportunityData.clientName,
        expectedStartDate: opportunityData.expectedStartDate,
        probability: opportunityData.probability,
        status: 'In Progress', // Add required status field with default value
      });

      const validatedData = validateSingleOpportunityData(response.data, endpoint);

      return {
        success: true,
        data: validatedData,
        error: null,
      };
    } catch (error) {
      if (error instanceof ApiValidationError) {
        return {
          success: false,
          error,
        };
      }

      const apiError = new ApiValidationError(
        error instanceof Error ? error.message : 'Failed to create opportunity',
        endpoint,
        {
          originalError: error as Error,
          status: (error as any)?.response?.status,
          statusText: (error as any)?.response?.statusText,
        }
      );

      return {
        success: false,
        error: apiError,
      };
    }
  },
};

// ===== HELPER FUNCTIONS =====

/**
 * Check if an error is an ApiValidationError
 */
export function isApiValidationError(error: unknown): error is ApiValidationError {
  return error instanceof ApiValidationError;
}

/**
 * Extract user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiValidationError(error)) {
    return error.getUserFriendlyMessage();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Create a validation error for testing purposes
 */
export function createTestValidationError(
  message: string,
  endpoint: string,
  validationErrors?: ValidationErrorDetails
): ApiValidationError {
  return new ApiValidationError(message, endpoint, {
    status: 400,
    statusText: 'Bad Request',
    validationErrors,
  });
} 