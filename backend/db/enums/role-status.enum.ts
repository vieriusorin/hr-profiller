import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Role status enum
 *
 * @description
 * This is an enum for role status within opportunities.
 * It represents the current state of role fulfillment.
 */
export const roleStatusEnum = pgEnum('role_status', [
  'Open',
  'Staffed',
  'Won',
  'Lost',
]);

/**
 * Type for the role status enum
 * @description
 * This is a type for the role status enum.
 * It is used to store role fulfillment status.
 */
export type TypeRoleStatus = (typeof roleStatusEnum.enumValues)[number]; 