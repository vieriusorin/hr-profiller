import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Positions table
 *
 * @description
 * This is a table for job positions.
 * It stores information about open positions in the company.
 */
export const positions = pgTable('positions', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  departmentId: integer('department_id'),
  description: text('description'),
  requirements: text('requirements'),
  status: varchar('status', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(positions);

// Create a modified insert schema that excludes auto-generated fields
export const insertPositionSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(positions);

// Create a modified select schema
export const selectPositionSchema = baseSelectSchema;

export type TypePosition = z.infer<typeof selectPositionSchema>;
export type TypeNewPosition = z.infer<typeof insertPositionSchema>;