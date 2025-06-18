import { pgTable, integer, varchar, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Project Technologies table
 *
 * @description
 * This is a junction table for projects and technologies.
 * It stores which technologies are used in which projects.
 */
export const projectTechnologies = pgTable('project_technologies', {
  projectId: integer('project_id').notNull(),
  technologyId: integer('technology_id').notNull(),
  proficiencyRequired: varchar('proficiency_required', { length: 50 }),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.projectId, table.technologyId] }),
  };
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(projectTechnologies);

// Create a modified insert schema
export const insertProjectTechnologySchema = baseInsertSchema.omit({
  createdAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(projectTechnologies);

// Create a modified select schema
export const selectProjectTechnologySchema = baseSelectSchema;

export type TypeProjectTechnology = z.infer<typeof selectProjectTechnologySchema>;
export type TypeNewProjectTechnology = z.infer<typeof insertProjectTechnologySchema>;