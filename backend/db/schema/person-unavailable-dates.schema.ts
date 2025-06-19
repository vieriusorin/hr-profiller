import { pgTable, uuid, date, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { people } from './people.schema';

/**
 * Person Unavailable Dates table
 *
 * @description
 * This table replaces employee_unavailable_dates and works for any person
 * regardless of their current status. It can track vacation, sick leave,
 * training periods, or any other unavailability for candidates or employees.
 */
export const personUnavailableDates = pgTable('person_unavailable_dates', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id')
    .references(() => people.id)
    .notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  reason: text('reason'), // Vacation, Sick Leave, Training, Personal, etc.
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(personUnavailableDates);

// Create a modified insert schema that excludes auto-generated fields
export const insertPersonUnavailableDateSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(personUnavailableDates);

// Create a modified select schema
export const selectPersonUnavailableDateSchema = baseSelectSchema;

export type TypePersonUnavailableDate = z.infer<typeof selectPersonUnavailableDateSchema>;
export type TypeNewPersonUnavailableDate = z.infer<typeof insertPersonUnavailableDateSchema>; 