import { pgTable, serial, timestamp, integer, boolean, text } from 'drizzle-orm/pg-core';
import { applicants } from './applicants.schema';
import { roles } from './roles.schema';
import { applicationStatusEnum } from '../enums/applicant-status.enum';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Applications table
 *
 * @description
 * This is a table for the applications.
 * It is used to store the applications.
 *
 * @schema
 * id: serial
 * applicantId: integer
 * roleId: integer
 * status: applicationStatusEnum
 * inProgress: boolean
 * notes: text
 */
export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  applicantId: integer('applicant_id')
    .references(() => applicants.id)
    .notNull(),
  roleId: integer('role_id')
    .references(() => roles.id)
    .notNull(),
  status: applicationStatusEnum('status').notNull().default('applied'),
  inProgress: boolean('in_progress').default(false),
  notes: text('notes'),
  appliedAt: timestamp('applied_at').defaultNow(),
  screeningAt: timestamp('screening_at'),
  interviewAt: timestamp('interview_at'),
  offerAt: timestamp('offer_at'),
  rejectedAt: timestamp('rejected_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Zod schemas for applications
 *
 * @description
 * This is a schema for the applications table.
 * It is used to validate the data that is inserted into the table.
 */

// Create the base insert schema
const baseInsertSchema = createInsertSchema(applications);

// Create a modified insert schema that excludes auto-generated fields
export const insertApplicationSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TypeApplication = z.infer<typeof insertApplicationSchema>;
