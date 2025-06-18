import { pgTable, serial, integer, varchar, date, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Education table
 *
 * @description
 * This is a table for education records.
 * It stores education information for both candidates and employees.
 */
export const education = pgTable('education', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id'),
  employeeId: integer('employee_id'),
  institution: varchar('institution', { length: 255 }).notNull(),
  degree: varchar('degree', { length: 100 }),
  fieldOfStudy: varchar('field_of_study', { length: 100 }),
  startDate: date('start_date'),
  graduationDate: date('graduation_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(education);

// Create a modified insert schema that excludes auto-generated fields
export const insertEducationSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(education);

// Create a modified select schema
export const selectEducationSchema = baseSelectSchema;

export type TypeEducation = z.infer<typeof selectEducationSchema>;
export type TypeNewEducation = z.infer<typeof insertEducationSchema>;