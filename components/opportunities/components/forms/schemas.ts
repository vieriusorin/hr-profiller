import { z } from 'zod';

const GradeSchema = z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM'] as const);

export const createOpportunitySchema = z.object({
  clientName: z
    .string()
    .min(1, 'Client name is required')
    .min(2, 'Client name must be at least 2 characters')
    .max(100, 'Client name must be less than 100 characters'),

  opportunityName: z
    .string()
    .min(1, 'Opportunity name is required')
    .min(2, 'Opportunity name must be at least 2 characters')
    .max(100, 'Opportunity name must be less than 100 characters'),

  expectedStartDate: z
    .string()
    .min(1, 'Expected start date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Expected start date cannot be in the past'),

  probability: z
    .number({
      required_error: 'Probability is required',
      invalid_type_error: 'Probability must be a number',
    })
    .min(0, 'Probability must be at least 0%')
    .max(100, 'Probability cannot exceed 100%')
    .refine((val) => val % 10 === 0, 'Probability must be divisible by 10'),

  comment: z
    .string()
    .max(500, 'Comment must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export const createRoleSchema = z.object({
  roleName: z
    .string()
    .min(1, 'Role name is required')
    .min(2, 'Role name must be at least 2 characters')
    .max(100, 'Role name must be less than 100 characters'),

  requiredGrade: GradeSchema,

  allocation: z
    .number({
      required_error: 'Allocation is required',
      invalid_type_error: 'Allocation must be a number',
    })
    .min(0, 'Allocation cannot be negative')
    .max(100, 'Allocation cannot exceed 100%')
    .int('Allocation must be a whole number'),

  needsHire: z.boolean(),

  comments: z
    .string()
    .max(500, 'Comments must be less than 500 characters')
    .optional()
    .or(z.literal('')),

  assignedMemberIds: z.array(z.string()).optional(),
  newHireName: z.string().optional(),
});

export type CreateOpportunityFormData = z.infer<typeof createOpportunitySchema>;
export type CreateRoleFormData = z.infer<typeof createRoleSchema>; 
