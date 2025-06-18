import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Employee type enum
 * @description
 * This is a enum for the employee type.
 * It is used to store the employee type.
 */
export const employeeTypeEnum = pgEnum('employee_type', ['full_time', 'part_time', 'contractor']);

/**
 * Type for the employee type enum
 * @description
 * This is a type for the employee type enum.
 * It is used to store the employee type.
 */
export type TypeEmployeeType = (typeof employeeTypeEnum.enumValues)[number];
