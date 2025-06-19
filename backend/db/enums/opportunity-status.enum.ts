import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Opportunity status enum
 *
 * @description
 * This is an enum for the opportunity status.
 * It represents the current state of business opportunities.
 */
export const opportunityStatusEnum = pgEnum('opportunity_status', [
  'In Progress',
  'On Hold',
  'Done',
]);

/**
 * Type for the opportunity status enum
 * @description
 * This is a type for the opportunity status enum.
 * It is used to store the opportunity status.
 */
export type TypeOpportunityStatus = (typeof opportunityStatusEnum.enumValues)[number]; 