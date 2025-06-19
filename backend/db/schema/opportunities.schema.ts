import { pgTable, uuid, varchar, timestamp, text, date, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { clients } from './clients.schema';
import { opportunityStatusEnum } from '../enums/opportunity-status.enum';

/**
 * Opportunities table
 *
 * @description
 * This is a table for business opportunities.
 * It stores information about potential client projects and deals.
 */
export const opportunities = pgTable('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  opportunityName: varchar('opportunity_name', { length: 255 }).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  clientName: varchar('client_name', { length: 255 }), // Backup for cases where client isn't in clients table
  expectedStartDate: date('expected_start_date'),
  expectedEndDate: date('expected_end_date'),
  probability: integer('probability'), // Percentage 0-100
  status: opportunityStatusEnum('status').notNull().default('In Progress'),
  comment: text('comment'),
  isActive: boolean('is_active').default(false),
  activatedAt: timestamp('activated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create the base insert schema
const baseInsertSchema = createInsertSchema(opportunities);

// Create a modified insert schema that excludes auto-generated fields
export const insertOpportunitySchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Create the base select schema
const baseSelectSchema = createSelectSchema(opportunities);

// Create a modified select schema
export const selectOpportunitySchema = baseSelectSchema;

export type TypeOpportunity = z.infer<typeof selectOpportunitySchema>;
export type TypeNewOpportunity = z.infer<typeof insertOpportunitySchema>; 