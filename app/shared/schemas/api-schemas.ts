import { z } from 'zod';

export const OpportunityIdSchema = z.string();
export const RoleIdSchema = z.string();
export const MemberIdSchema = z.string();

export const OpportunityStatusSchema = z.enum(['In Progress', 'On Hold', 'Done']);
export const RoleStatusSchema = z.enum(['Open', 'Staffed', 'Won', 'Lost']);
export const GradeSchema = z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']);

export const MemberSchema = z.object({
  id: MemberIdSchema,
  fullName: z.string().min(1, 'Member name is required'),
  actualGrade: GradeSchema,
  allocation: z.number().min(0).max(100),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export const RoleSchema = z.object({
  id: RoleIdSchema,
  roleName: z.string().min(1, 'Role name is required'),
  requiredGrade: GradeSchema,
  status: RoleStatusSchema,
  assignedMember: MemberSchema.nullable(),
  allocation: z.number().min(0).max(100),
  needsHire: z.boolean(),
  comments: z.string(),
});

export const OpportunitySchema = z.object({
  id: OpportunityIdSchema,
  clientName: z.string().min(1, 'Client name is required'),
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  expectedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  probability: z.number().min(0).max(100),
  status: OpportunityStatusSchema,
  roles: z.array(RoleSchema),
});

export const OpportunitiesArraySchema = z.array(OpportunitySchema);

export const CreateOpportunityInputSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  expectedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  probability: z.number().min(0).max(100),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export const CreateRoleInputSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  requiredGrade: GradeSchema,
  needsHire: z.enum(['Yes', 'No']),
  comments: z.string(),
});

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

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.object({
    field: z.string().optional(),
    code: z.string(),
    message: z.string(),
  })).optional(),
});

export const ApiResponseSchema = z.union([
  OpportunityApiResponseSchema,
  OpportunitiesApiResponseSchema,
  ApiErrorSchema,
]);

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
