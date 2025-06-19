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
  
  // Services
  OpportunityService: Symbol.for('OpportunityService'),
  
  // Controllers
  OpportunityController: Symbol.for('OpportunityController'),
};

// Type alias for the database with proper schema
export type DatabaseType = NodePgDatabase<typeof schema>;

export { TYPES };

// Export the new presenter types
export * from './presenter.types';

// Export presentation types (schema + computed fields)
export * from './presentation.types';
