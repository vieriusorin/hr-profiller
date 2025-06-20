export interface ResponseEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  message: string;
  code: string;
  stack?: string;
}

import type * as schema from '../../../db/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

const TYPES = {
  // Infrastructure
  Database: Symbol.for('Database') as symbol,

  // Repositories
  OpportunityRepository: Symbol.for('OpportunityRepository'),
  RoleRepository: Symbol.for('RoleRepository'),
  EmployeeRepository: Symbol.for('EmployeeRepository'),

  // Services
  OpportunityService: Symbol.for('OpportunityService'),
  EmployeeService: Symbol.for('EmployeeService'),

  // Controllers
  OpportunityController: Symbol.for('OpportunityController'),
  RoleController: Symbol.for('RoleController'),
  EmployeeController: Symbol.for('EmployeeController'),
  LookupController: Symbol.for('LookupController'),
};

// Type alias for the database with proper schema
export type DatabaseType = NodePgDatabase<typeof schema>;

export { TYPES };

// Export the new presenter types
export * from './presenter.types';

// Export presentation types (schema + computed fields)
export * from './presentation.types';
