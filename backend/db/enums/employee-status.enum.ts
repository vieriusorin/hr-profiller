import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Employee status enum
 *
 * @description
 * This is an enum for employee status.
 * It represents the current employment status of an employee.
 */
export const employeeStatusEnum = pgEnum('employee_status', [
  'Active',
  'On Leave',
  'Inactive',
]);

/**
 * Type for the employee status enum
 * @description
 * This is a type for the employee status enum.
 * It is used to store employee status.
 */
export type TypeEmployeeStatus = (typeof employeeStatusEnum.enumValues)[number]; 