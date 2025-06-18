import { pgTable, integer, varchar, decimal, date, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Project Team Members table
 *
 * @description
 * This is a junction table for projects and employees.
 * It stores which employees are assigned to which projects.
 */
export const projectTeamMembers = pgTable('project_team_members', {
  projectId: integer('project_id').notNull(),
  employeeId: integer('employee_id').notNull(),
  role: varchar('role', { length: 100 }),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  allocationPercentage: integer('allocation_percentage'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.projectId, table.employeeId] }),
  };
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(projectTeamMembers);

// Create a modified insert schema
export const insertProjectTeamMemberSchema = baseInsertSchema.omit({
  createdAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(projectTeamMembers);

// Create a modified select schema
export const selectProjectTeamMemberSchema = baseSelectSchema;

export type TypeProjectTeamMember = z.infer<typeof selectProjectTeamMemberSchema>;
export type TypeNewProjectTeamMember = z.infer<typeof insertProjectTeamMemberSchema>;