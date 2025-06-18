import { pgTable, serial, varchar, timestamp, text, decimal, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Departments table
 *
 * @description
 * This is a table for the departments.
 * It stores department information.
 */
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  managerId: integer('manager_id'),
  location: varchar('location', { length: 100 }),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(departments);

// Create a modified insert schema that excludes auto-generated fields
export const insertDepartmentSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(departments);

// Create a modified select schema
export const selectDepartmentSchema = baseSelectSchema;

export type TypeDepartment = z.infer<typeof selectDepartmentSchema>;
export type TypeNewDepartment = z.infer<typeof insertDepartmentSchema>;