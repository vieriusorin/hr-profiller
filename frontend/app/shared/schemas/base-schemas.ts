import { z } from 'zod';

export const OpportunityIdSchema = z.string();
export const RoleIdSchema = z.string();
export const MemberIdSchema = z.string();

export const OpportunityStatusSchema = z.enum(['In Progress', 'On Hold', 'Done']);
export const RoleStatusSchema = z.enum(['Open', 'Staffed', 'Won', 'Lost']);
export const GradeSchema = z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']);
export const OpportunityLevelSchema = z.enum(['High', 'Medium', 'Low']);

export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  position: z.string(),
  department: z.string(),
  employeeStatus: z.string(),
  workStatus: z.string(),
  hireDate: z.string(),
  jobGrade: z.string(),
  location: z.string(),
});

export const ClientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Client name is required'),
});

export const ProbabilitySchema = z.number().min(0).max(100);

export type OpportunityId = z.infer<typeof OpportunityIdSchema>;
export type RoleId = z.infer<typeof RoleIdSchema>;
export type MemberId = z.infer<typeof MemberIdSchema>;
export type OpportunityStatus = z.infer<typeof OpportunityStatusSchema>;
export type RoleStatus = z.infer<typeof RoleStatusSchema>;
export type Grade = z.infer<typeof GradeSchema>;
export type OpportunityLevel = z.infer<typeof OpportunityLevelSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Client = z.infer<typeof ClientSchema>; 