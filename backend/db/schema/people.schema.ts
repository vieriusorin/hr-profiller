import { pgTable, uuid, varchar, timestamp, text, date } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * People table
 *
 * @description
 * This is the core table for all people in the system.
 * It serves as the single source of truth for person data,
 * regardless of their current status (candidate, employee, etc.)
 */
export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  birthDate: date('birth_date'),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const baseInsertSchema = createInsertSchema(people);
export const insertPersonSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const baseSelectSchema = createSelectSchema(people);
export const selectPersonSchema = baseSelectSchema;

export type TypePerson = z.infer<typeof selectPersonSchema>;
export type TypeNewPerson = z.infer<typeof insertPersonSchema>; 