import { pgTable, serial, varchar, timestamp, text, date, decimal, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Projects table
 *
 * @description
 * This is a table for projects.
 * It stores information about client projects.
 */
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  description: text('description'),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  startDate: date('start_date'),
  endDate: date('end_date'),
  employmentType: varchar('employment_type', { length: 50 }),
  status: varchar('status', { length: 50 }),
  clientId: integer('client_id'),
  projectManagerId: integer('project_manager_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(projects);

// Create a modified insert schema that excludes auto-generated fields
export const insertProjectSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(projects);

// Create a modified select schema
export const selectProjectSchema = baseSelectSchema;

export type TypeProject = z.infer<typeof selectProjectSchema>;
export type TypeNewProject = z.infer<typeof insertProjectSchema>;