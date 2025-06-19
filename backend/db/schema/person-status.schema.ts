import { pgTable, uuid, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { people } from './people.schema';
import { personStatusEnum } from '../enums/person-status.enum';

/**
 * Person Status table
 *
 * @description
 * This table tracks the current lifecycle stage of each person.
 * It allows us to know if someone is currently a candidate, employee, etc.
 * We could extend this to track status history if needed.
 */
export const personStatus = pgTable('person_status', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id')
    .references(() => people.id)
    .notNull()
    .unique(), // Each person has only one current status
  status: personStatusEnum('status').notNull().default('candidate'),
  statusChangedAt: timestamp('status_changed_at').defaultNow(),
  notes: text('notes'), // Reason for status change, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(personStatus);

// Create a modified insert schema that excludes auto-generated fields
export const insertPersonStatusSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(personStatus);

// Create a modified select schema
export const selectPersonStatusSchema = baseSelectSchema;

export type TypePersonStatusRecord = z.infer<typeof selectPersonStatusSchema>;
export type TypeNewPersonStatusRecord = z.infer<typeof insertPersonStatusSchema>; 