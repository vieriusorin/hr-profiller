import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { opportunityRoles } from './opportunity-roles.schema';
import { people } from './people.schema';

/**
 * Opportunity Role Assignments table
 *
 * @description
 * This is a junction table for assigning people to opportunity roles.
 * It handles the many-to-many relationship between opportunity roles and people.
 * Works for both candidates and employees through the normalized people table.
 */
export const opportunityRoleAssignments = pgTable('opportunity_role_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  opportunityRoleId: uuid('opportunity_role_id')
    .references(() => opportunityRoles.id)
    .notNull(),
  personId: uuid('person_id')
    .references(() => people.id)
    .notNull(),
  assignedAt: timestamp('assigned_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(opportunityRoleAssignments);

// Create a modified insert schema that excludes auto-generated fields
export const insertOpportunityRoleAssignmentSchema = baseInsertSchema.omit({
  id: true,
  assignedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(opportunityRoleAssignments);

// Create a modified select schema
export const selectOpportunityRoleAssignmentSchema = baseSelectSchema;

export type TypeOpportunityRoleAssignment = z.infer<typeof selectOpportunityRoleAssignmentSchema>;
export type TypeNewOpportunityRoleAssignment = z.infer<typeof insertOpportunityRoleAssignmentSchema>; 