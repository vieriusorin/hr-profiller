import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  date,
  decimal,
  integer,
} from 'drizzle-orm/pg-core';
import { departments } from '../../../../db/schema/departments.schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Candidates table
 *
 * @description
 * This is a table for the candidates.
 * It is used to store candidate information for the hiring process.
 *
 * @schema
 * id: serial
 * fullName: varchar
 * email: varchar
 * phone: varchar
 * birthDate: date
 * city: varchar
 * country: varchar
 * notes: text
 * hourlyRate: decimal
 * status: varchar
 * role: varchar
 * departmentId: integer
 * createdAt: timestamp
 * updatedAt: timestamp
 */
export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  birthDate: date('birth_date'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  notes: text('notes'),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 50 }).default('active'),
  role: varchar('role', { length: 100 }),
  departmentId: integer('department_id').references(() => departments.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Zod schemas for candidates
 *
 * @description
 * This is a schema for the candidates table.
 * It is used to validate the data that is inserted into the table.
 */

// Create the base insert schema
const baseInsertSchema = createInsertSchema(candidates);

// Create a modified insert schema that excludes auto-generated fields
export const insertCandidateSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(candidates);

// Create a modified select schema
export const selectCandidateSchema = baseSelectSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type TypeCandidate = z.infer<typeof selectCandidateSchema>;
export type TypeNewCandidate = z.infer<typeof insertCandidateSchema>;
