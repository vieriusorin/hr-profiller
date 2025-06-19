import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Opportunity level enum
 *
 * @description
 * This is an enum for opportunity priority/importance levels.
 * It represents the business priority of roles within opportunities.
 */
export const opportunityLevelEnum = pgEnum('opportunity_level', [
  'Low',
  'Medium',
  'High',
]);

/**
 * Type for the opportunity level enum
 * @description
 * This is a type for the opportunity level enum.
 * It is used to store opportunity priority levels.
 */
export type TypeOpportunityLevel = (typeof opportunityLevelEnum.enumValues)[number]; 