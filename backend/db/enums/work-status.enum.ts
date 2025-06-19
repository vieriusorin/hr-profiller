import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Work status enum
 *
 * @description
 * This is an enum for work status.
 * It represents the current work assignment status of an employee.
 */
export const workStatusEnum = pgEnum('work_status', [
  'On Project',
  'On Bench',
  'Available',
]);

/**
 * Type for the work status enum
 * @description
 * This is a type for the work status enum.
 * It is used to store work status.
 */
export type TypeWorkStatus = (typeof workStatusEnum.enumValues)[number]; 