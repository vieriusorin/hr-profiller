import { integer, pgTable, serial, timestamp, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Application metrics table
 *
 * @description
 * This is a table for the application metrics.
 * It is used to store the application metrics.
 *
 * @schema
 * id: serial
 * month: date
 * appliedCount: integer
 * screeningCount: integer
 * interviewCount: integer
 * offerCount: integer
 */
export const applicationMetrics = pgTable('application_metrics', {
  id: serial('id').primaryKey(),
  month: date('month').notNull(),
  appliedCount: integer('applied_count').default(0),
  screeningCount: integer('screening_count').default(0),
  interviewCount: integer('interview_count').default(0),
  offerCount: integer('offer_count').default(0),
  rejectedCount: integer('rejected_count').default(0),
  completedCount: integer('completed_count').default(0),
  remainingCount: integer('remaining_count').default(0),
  inProgressCount: integer('in_progress_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Zod schemas for application metrics
 *
 * @description
 * This is a schema for the application metrics table.
 * It is used to validate the data that is inserted into the table.
 */

// Create the base insert schema
const baseInsertSchema = createInsertSchema(applicationMetrics);

// Create a modified insert schema that excludes auto-generated fields
export const insertApplicationMetricsSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TypeApplicationMetrics = z.infer<typeof insertApplicationMetricsSchema>;
