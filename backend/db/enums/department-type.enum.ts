import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Department type enum
 *
 * @description
 * This is a enum for the department type.
 * It is used to store the department type.
 */
export const departmentTypeEnum = pgEnum('department_type', [
  'sales',
  'marketing',
  'engineering',
  'hr',
  'finance',
  'legal',
  'customer_support',
  'product',
  'design',
]);

/**
 * Type for the department type enum
 * @description
 * This is a type for the department type enum.
 * It is used to store the department type.
 */
export type TypeDepartmentType = (typeof departmentTypeEnum.enumValues)[number];
