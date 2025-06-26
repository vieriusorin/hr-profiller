export interface ResponseEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  meta?: Record<string, any>;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: any; // For validation errors and other detailed error information
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
  PersonRepository: Symbol.for('PersonRepository'),
  EmploymentRepository: Symbol.for('EmploymentRepository'),

  // Services
  OpportunityService: Symbol.for('OpportunityService'),
  RoleService: Symbol.for('RoleService'),
  PersonService: Symbol.for('PersonService'),
  EmploymentService: Symbol.for('EmploymentService'),
  EmployeeApplicationService: Symbol.for('EmployeeApplicationService'),
  McpClientService: Symbol.for('McpClientService'),
  OpenAIService: Symbol.for('OpenAIService'),
  VectorDatabaseService: Symbol.for('VectorDatabaseService'),
  RAGService: Symbol.for('RAGService'),

  // Controllers
  OpportunityController: Symbol.for('OpportunityController'),
  RoleController: Symbol.for('RoleController'),
  EmployeeController: Symbol.for('EmployeeController'),
  PersonController: Symbol.for('PersonController'),
  LookupController: Symbol.for('LookupController'),
  McpController: Symbol.for('McpController'),
  AIController: Symbol.for('AIController'),
  AuthController: Symbol.for('AuthController'),
};

// Type alias for the database with proper schema
export type DatabaseType = NodePgDatabase<typeof schema>;

export { TYPES };

// Export the new presenter types
export * from './presenter.types';

// Export presentation types (schema + computed fields)
export * from './presentation.types';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface ChatCompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}


export interface OpenAIService {
  generateCompletion(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    content: string;
    tokensUsed: number;
    model: string;
  }>;
}