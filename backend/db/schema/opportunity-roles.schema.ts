import { pgTable, uuid, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { opportunities } from './opportunities.schema';
import { jobGradeEnum } from '../enums/job-grade.enum';
import { opportunityLevelEnum } from '../enums/opportunity-level.enum';
import { roleStatusEnum } from '../enums/role-status.enum';

/**
 * Opportunity Roles table
 *
 * @description
 * This is a table for roles within business opportunities.
 * It stores role requirements and assignments for each opportunity.
 */
export const opportunityRoles = pgTable('opportunity_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  opportunityId: uuid('opportunity_id')
    .references(() => opportunities.id)
    .notNull(),
  roleName: varchar('role_name', { length: 255 }).notNull(),
  jobGrade: jobGradeEnum('job_grade'),
  level: opportunityLevelEnum('level'),
  allocation: integer('allocation'), // Percentage 0-100
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  status: roleStatusEnum('status').notNull().default('Open'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(opportunityRoles);

// Create a modified insert schema that excludes auto-generated fields
export const insertOpportunityRoleSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(opportunityRoles);

// Create a modified select schema
export const selectOpportunityRoleSchema = baseSelectSchema;

export type TypeOpportunityRole = z.infer<typeof selectOpportunityRoleSchema>;
export type TypeNewOpportunityRole = z.infer<typeof insertOpportunityRoleSchema>; 