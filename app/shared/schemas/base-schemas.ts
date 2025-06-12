import { z } from 'zod';

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

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Client name is required'),
});

export const ProbabilitySchema = z.number().min(0).max(100); 