import { z } from 'zod';

export const OpportunityIdSchema = z.string();
export const RoleIdSchema = z.string();
export const MemberIdSchema = z.string();

export const OpportunityStatusSchema = z.enum(['In Progress', 'On Hold', 'Done']);
export const RoleStatusSchema = z.enum(['Open', 'Staffed', 'Won', 'Lost']);
export const GradeSchema = z.enum(['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']);
export const OpportunityLevelSchema = z.enum(['High', 'Medium', 'Low']);

export const EmployeeStatusSchema = z.enum(['Active', 'On Leave', 'Terminated']);
export const WorkStatusSchema = z.enum(['On Project', 'On Bench', 'Available']);

export const PersonSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const EmploymentDetailsSchema = z.object({
  id: z.string().uuid(),
  personId: z.string().uuid(),
  employeeId: z.string().optional().nullable(),
  hireDate: z.string(),
  terminationDate: z.string().optional().nullable(),
  position: z.string(),
  employmentType: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  hourlyRate: z.string().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  employeeStatus: EmployeeStatusSchema,
  workStatus: WorkStatusSchema,
  jobGrade: GradeSchema.optional().nullable(),
  location: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const EmployeeSchema = PersonSchema.merge(EmploymentDetailsSchema);

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
export type Person = z.infer<typeof PersonSchema>;
export type EmploymentDetails = z.infer<typeof EmploymentDetailsSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type Client = z.infer<typeof ClientSchema>; 