import { integer, pgTable, serial, timestamp, date } from 'drizzle-orm/pg-core';
import { departments } from './departments.schema';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Employee stats table
 *
 * @description
 * This is a table for the employee stats.
 * It is used to store the employee stats.
 *
 * @schema
 * id: serial
 * month: date
 * departmentId: integer
 * fullTimeCount: integer
 * partTimeCount: integer
 * contractorCount: integer
 * totalCount: integer
 * createdAt: timestamp
 * updatedAt: timestamp
 */
export const employeeStats = pgTable('employee_stats', {
  id: serial('id').primaryKey(),
  month: date('month').notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  fullTimeCount: integer('full_time_count').default(0),
  partTimeCount: integer('part_time_count').default(0),
  contractorCount: integer('contractor_count').default(0),
  totalCount: integer('total_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Zod schemas for employee stats
 *
 * @description
 * This is a schema for the employee stats table.
 * It is used to validate the data that is inserted into the table.
 */

// Create the base insert schema
const baseInsertSchema = createInsertSchema(employeeStats);

// Create a modified insert schema that excludes auto-generated fields
export const insertEmployeeStatsSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TypeEmployeeStats = z.infer<typeof insertEmployeeStatsSchema>;
