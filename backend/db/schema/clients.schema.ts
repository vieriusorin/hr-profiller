import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Clients table
 *
 * @description
 * This is a table for clients.
 * It stores information about client companies.
 */
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 100 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const baseInsertSchema = createInsertSchema(clients);

export const insertClientSchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const baseSelectSchema = createSelectSchema(clients);

export const selectClientSchema = baseSelectSchema;

export type TypeClient = z.infer<typeof selectClientSchema>;
export type TypeNewClient = z.infer<typeof insertClientSchema>;