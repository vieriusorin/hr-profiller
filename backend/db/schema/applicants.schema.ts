import { ApplicantStatus } from '../../src/domain/applicant/entities/applicant.entity';
import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Applicants table
 *
 * @description
 * This is a table for the applicants.
 * It is used to store the applicants.
 *
 * @schema
 * id: serial
 * firstName: varchar
 * lastName: varchar
 * email: varchar
 * phone: varchar
 * resumeUrl: varchar
 */
export const applicants = pgTable('applicants', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  status: text('status').$type<ApplicantStatus>().default(ApplicantStatus.APPLIED),
  resumeUrl: varchar('resume_url', { length: 2048 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Zod schemas for applicants
 *
 * @description
 * This is a schema for the applicants table.
 * It is used to validate the data that is inserted into the table.
 */

// Create the base insert schema
const baseInsertSchema = createInsertSchema(applicants);

// Create a modified insert schema that excludes auto-generated fields
export const insertApplicantSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(applicants);

// Create a modified select schema that only includes the firstName, lastName, and email fields
export const selectApplicantSchema = baseSelectSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type TypeApplicant = z.infer<typeof selectApplicantSchema>;
