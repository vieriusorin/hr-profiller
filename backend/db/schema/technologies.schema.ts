import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Technologies table
 *
 * @description
 * This is a table for technologies.
 * It stores information about different technologies used in projects.
 */
export const technologies = pgTable('technologies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(technologies);

// Create a modified insert schema that excludes auto-generated fields
export const insertTechnologySchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(technologies);

// Create a modified select schema
export const selectTechnologySchema = baseSelectSchema;

export type TypeTechnology = z.infer<typeof selectTechnologySchema>;
export type TypeNewTechnology = z.infer<typeof insertTechnologySchema>;