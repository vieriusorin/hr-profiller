import { pgTable, serial, integer, varchar, date, boolean, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Work Experience table
 *
 * @description
 * This is a table for work experience records.
 * It stores work history for both candidates and employees.
 */
export const workExperience = pgTable('work_experience', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id'),
  employeeId: integer('employee_id'),
  jobTitle: varchar('job_title', { length: 100 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  location: varchar('location', { length: 100 }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  isCurrent: boolean('is_current').default(false),
  employmentType: varchar('employment_type', { length: 50 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(workExperience);

// Create a modified insert schema that excludes auto-generated fields
export const insertWorkExperienceSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(workExperience);

// Create a modified select schema
export const selectWorkExperienceSchema = baseSelectSchema;

export type TypeWorkExperience = z.infer<typeof selectWorkExperienceSchema>;
export type TypeNewWorkExperience = z.infer<typeof insertWorkExperienceSchema>;