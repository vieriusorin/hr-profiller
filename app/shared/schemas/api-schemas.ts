import { z } from 'zod';

// Base schemas for IDs and enums
export const OpportunityIdSchema = z.number().int().positive();
export const RoleIdSchema = z.number().int().positive();
export const MemberIdSchema = z.number().int().positive();

export const OpportunityStatusSchema = z.enum(['In Progress', 'On Hold', 'Done']);
export const RoleStatusSchema = z.enum(['Open', 'Staffed', 'Won', 'Lost']);
export const GradeSchema = z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']);

// Member schema
export const MemberSchema = z.object({
  id: MemberIdSchema,
  fullName: z.string().min(1, 'Member name is required'),
  actualGrade: GradeSchema,
  allocation: z.number().min(0).max(100),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

// Role schema
export const RoleSchema = z.object({
  id: RoleIdSchema,
  roleName: z.string().min(1, 'Role name is required'),
  requiredGrade: GradeSchema,
  status: RoleStatusSchema,
  assignedMember: MemberSchema.nullable(),
  needsHire: z.boolean(),
  comments: z.string(),
});

// Opportunity schema
export const OpportunitySchema = z.object({
  id: OpportunityIdSchema,
  clientName: z.string().min(1, 'Client name is required'),
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  openDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  expectedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  probability: z.number().min(0).max(100),
  status: OpportunityStatusSchema,
  roles: z.array(RoleSchema),
});

// Array schemas for API responses
export const OpportunitiesArraySchema = z.array(OpportunitySchema);

// Form input schemas (for create/update operations)
export const CreateOpportunityInputSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  expectedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  probability: z.number().min(0).max(100),
});

export const CreateRoleInputSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  requiredGrade: GradeSchema,
  needsHire: z.enum(['Yes', 'No']),
  comments: z.string(),
});

// API response wrappers for different endpoints
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

// Error response schema
export const ApiErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.object({
    field: z.string().optional(),
    code: z.string(),
    message: z.string(),
  })).optional(),
});

// Union type for API responses (success or error)
export const ApiResponseSchema = z.union([
  OpportunityApiResponseSchema,
  OpportunitiesApiResponseSchema,
  ApiErrorSchema,
]);

// Type inference - reuse these instead of duplicating TypeScript types
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;
export type RoleStatus = z.infer<typeof RoleStatusSchema>;
export type Grade = z.infer<typeof GradeSchema>;

export type CreateOpportunityInput = z.infer<typeof CreateOpportunityInputSchema>;
export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;

export type OpportunityApiResponse = z.infer<typeof OpportunityApiResponseSchema>;
export type OpportunitiesApiResponse = z.infer<typeof OpportunitiesApiResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

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
  const result = validateOpportunities(data);
  if (result.success) {
    return result.data;
  }
  
  console.error('Failed to validate opportunities data:', result.error.format());
  
  // Try to salvage individual opportunities
  if (Array.isArray(data)) {
    const validOpportunities: Opportunity[] = [];
    data.forEach((item, index) => {
      const itemResult = validateOpportunity(item);
      if (itemResult.success) {
        validOpportunities.push(itemResult.data);
      } else {
        console.warn(`Skipping invalid opportunity at index ${index}:`, itemResult.error.format());
      }
    });
    return validOpportunities;
  }
  
  return []; // Return empty array as fallback
}; 