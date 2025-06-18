import { integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { departments } from './departments.schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Roles table
 *
 * @description
 * This is a table for the roles.
 * It is used to store the roles.
 *
 * @schema
 * id: serial
 * title: varchar
 * departmentId: integer
 * createdAt: timestamp
 * updatedAt: timestamp
 */
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Zod schemas for roles
 *
 * @description
 * This is a schema for the roles table.
 * It is used to validate the data that is inserted into the table.
 */

// Create the base insert schema
const baseInsertSchema = createInsertSchema(roles);

// Create a modified insert schema that excludes auto-generated fields
export const insertRoleSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(roles);

// Create a modified select schema that only includes the title field
export const selectRoleSchema = baseSelectSchema.pick({
  title: true,
  departmentId: true,
});

export type TypeRole = z.infer<typeof selectRoleSchema>;
