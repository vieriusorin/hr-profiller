import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Person status enum
 *
 * @description
 * This enum tracks the lifecycle stages of a person in the system.
 * A person progresses through: candidate → employee → former_employee
 */
export const personStatusEnum = pgEnum('person_status_type', [
  'candidate',
  'employee', 
  'former_employee',
  'inactive',
]);

/**
 * Type for the person status enum
 * @description
 * This is a type for the person status enum.
 * It is used to store person lifecycle status.
 */
export type TypePersonStatus = (typeof personStatusEnum.enumValues)[number]; 