import { z } from 'zod';
import {
  RoleIdSchema,
  RoleStatusSchema,
  GradeSchema,
} from '../base-schemas';

export const RoleSchema = z.object({
  id: RoleIdSchema,
  roleName: z.string().min(1, 'Role name is required'),
  requiredGrade: GradeSchema,
  allocation: z.number().min(0).max(100),
  needsHire: z.boolean(),
  comments: z.string().optional(),
  status: RoleStatusSchema,
  assignedMemberIds: z.array(z.string()).optional(),
  newHireName: z.string().optional(),
});

export const CreateRoleInputSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  requiredGrade: GradeSchema,
  allocation: z.number().min(0).max(100),
  needsHire: z.boolean(),
  comments: z.string().optional().or(z.literal('')),
  newHireName: z.string().optional(),
});

export const CreateRoleFormSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  requiredGrade: GradeSchema,
  allocation: z.number().min(0).max(100),
  needsHire: z.boolean(),
  comments: z.string().optional(),
  assignedMemberIds: z.array(z.string()).optional(),
  newHireName: z.string().optional(),
});

export const EditRoleFormSchema = CreateRoleFormSchema;

export const RoleResponseSchema = z.object({
  data: RoleSchema,
});

export const RolesResponseSchema = z.object({
  data: z.array(RoleSchema),
});

// Inferred types
export type Role = z.infer<typeof RoleSchema>;
export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;
export type CreateRoleForm = z.infer<typeof CreateRoleFormSchema>;
export type EditRoleForm = z.infer<typeof EditRoleFormSchema>; 