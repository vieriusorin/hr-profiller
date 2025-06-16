import { z } from 'zod';
import {
  RoleIdSchema,
  RoleStatusSchema,
  GradeSchema,
} from '../base-schemas';

const RoleBaseSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  requiredGrade: GradeSchema,
  allocation: z.number().min(0).max(100),
  needsHire: z.boolean(),
  comments: z.string().optional(),
  newHireName: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CreateRoleFormSchema = RoleBaseSchema.extend({
  assignedMemberIds: z.array(z.string()).optional(),
});

export const CreateRoleInputSchema = RoleBaseSchema.omit({ comments: true }).extend({
  comments: z.string().optional().or(z.literal('')),
});

export const RoleSchema = CreateRoleFormSchema.extend({
  id: RoleIdSchema,
  status: RoleStatusSchema,
});

export const EditRoleFormSchema = CreateRoleFormSchema;

export const RoleResponseSchema = z.object({
  data: RoleSchema,
});

export const RolesResponseSchema = z.object({
  data: z.array(RoleSchema),
});

export type Role = z.infer<typeof RoleSchema>;
export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;
export type CreateRoleForm = z.infer<typeof CreateRoleFormSchema>;
export type EditRoleForm = z.infer<typeof EditRoleFormSchema>; 