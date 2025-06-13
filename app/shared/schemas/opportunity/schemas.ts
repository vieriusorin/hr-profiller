import { z } from 'zod';
import {
  OpportunityIdSchema,
  OpportunityStatusSchema,
  ProbabilitySchema,
} from '../base-schemas';
import { RoleSchema } from '../role/schemas';

export const OpportunitySchema = z.object({
  id: OpportunityIdSchema,
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  clientName: z.string().min(1, 'Client name is required'),
  expectedStartDate: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date format'),
  status: OpportunityStatusSchema,
  probability: ProbabilitySchema,
  createdAt: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date format').optional(),
  roles: z.array(RoleSchema),
  comment: z.string().optional(),
});

export const OpportunitiesArraySchema = z.array(OpportunitySchema);

export const CreateOpportunityInputSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  expectedStartDate: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date format'),
  probability: z.number().min(0).max(100),
  createdAt: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date format'),
  comment: z.string().optional(),
});

export const CreateOpportunityFormSchema = CreateOpportunityInputSchema;
export const EditOpportunityFormSchema = CreateOpportunityFormSchema;

export const OpportunityApiResponseSchema = z.object({
  data: OpportunitySchema,
  success: z.boolean(),
  message: z.string().optional(),
});

export const OpportunitiesApiResponseSchema = z.object({
  data: OpportunitiesArraySchema,
  success: z.boolean(),
  message: z.string().optional(),
});

export const OpportunityResponseSchema = z.object({
  data: OpportunitySchema,
});

export const OpportunitiesResponseSchema = z.object({
  data: z.array(OpportunitySchema),
});

// Validation helper functions
export const validateOpportunity = (data: unknown): {
  success: true;
  data: Opportunity;
} | {
  success: false;
  error: z.ZodError;
} => {
  try {
    const validated = OpportunitySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

export const validateOpportunities = (data: unknown): {
  success: true;
  data: Opportunity[];
} | {
  success: false;
  error: z.ZodError;
} => {
  try {
    const validated = OpportunitiesArraySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

// Safe parsing with fallbacks
export const safeParseOpportunities = (data: unknown): Opportunity[] => {
  console.log('safeParseOpportunities', data);
  const result = validateOpportunities(data);

  if (result.success) {
    return result.data;
  }

  console.error('Failed to validate opportunities data:', JSON.stringify(result.error, null, 2));

  if (Array.isArray(data)) {
    const validOpportunities: Opportunity[] = [];
    data.forEach((item, index) => {
      const itemResult = validateOpportunity(item);
      if (itemResult.success) {
        validOpportunities.push(itemResult.data);
      } else {
        console.warn(`Skipping invalid opportunity at index ${index}:`, JSON.stringify(itemResult.error, null, 2));
      }
    });
    return validOpportunities;
  }

  return [];
};

// Inferred types
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type CreateOpportunityInput = z.infer<typeof CreateOpportunityInputSchema>;
export type CreateOpportunityForm = z.infer<typeof CreateOpportunityFormSchema>;
export type EditOpportunityForm = z.infer<typeof EditOpportunityFormSchema>;
export type OpportunityApiResponse = z.infer<typeof OpportunityApiResponseSchema>;
export type OpportunitiesApiResponse = z.infer<typeof OpportunitiesApiResponseSchema>; 