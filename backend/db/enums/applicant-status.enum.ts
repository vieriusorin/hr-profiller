import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Application status enum
 *
 * @description
 * This is a enum for the application status.
 * It is used to store the application status.
 */
export const applicationStatusEnum = pgEnum('application_status', [
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
]);

/**
 * Type for the application status enum
 * @description
 * This is a type for the application status enum.
 * It is used to store the application status.
 */
export type TypeApplicationStatus = (typeof applicationStatusEnum.enumValues)[number];
