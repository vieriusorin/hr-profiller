import { pgTable, uuid, varchar, timestamp, text, integer, boolean } from 'drizzle-orm/pg-core';
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
  expectedStartDate: timestamp('expected_start_date'),
  expectedEndDate: timestamp('expected_end_date'),
  probability: integer('probability'), // Percentage 0-100
  status: opportunityStatusEnum('status').notNull().default('In Progress'),
  comment: text('comment'),
  isActive: boolean('is_active').default(false),
  activatedAt: timestamp('activated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

const baseInsertSchema = createInsertSchema(opportunities);

export const CreateOpportunitySchema = baseInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Override timestamp fields to accept ISO strings and convert to Date objects
  expectedStartDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  expectedEndDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  activatedAt: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});

export const UpdateOpportunitySchema = baseInsertSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Override timestamp fields to accept ISO strings and convert to Date objects
  expectedStartDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined).or(z.undefined()),
  expectedEndDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined).or(z.undefined()),
  activatedAt: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined).or(z.undefined()),
});

const baseSelectSchema = createSelectSchema(opportunities);

export const selectOpportunitySchema = baseSelectSchema;

export type TypeOpportunity = z.infer<typeof selectOpportunitySchema>;
export type TypeNewOpportunity = z.infer<typeof CreateOpportunitySchema>;
export type TypeUpdateOpportunity = z.infer<typeof UpdateOpportunitySchema>; 