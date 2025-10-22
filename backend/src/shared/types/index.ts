/**
 * @description Generic response envelope for API responses.
 * @interface ResponseEnvelope
 * @template T - The type of the data contained in the response
 * @property status - The status of the response ('success' or 'error')
 * @property data - The data payload of the response
 * @property meta - Optional metadata about the response
 */
export interface ResponseEnvelope<T> {
  status: 'success' | 'error';
  data: T;
  meta?: Record<string, any>;
}

/**
 * @description Standardized error response structure.
 * @interface ErrorResponse
 * @property message - A descriptive error message
 * @property code - A machine-readable error code
 * @property details - Optional detailed information about the error
 * @property stack - Optional stack trace for debugging purposes
 */
export interface ErrorResponse {
  message: string;
  code: string;
  details?: any; // For validation errors and other detailed error information
  stack?: string;
}

import type * as schema from '../../../db/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * @description Dependency Injection Types
 * @constant TYPES - An object containing symbols for various services, repositories, and controllers
 * @type {object}
 * @property {symbol} Database - Symbol for the Database
 * @property {symbol} OpportunityRepository - Symbol for the Opportunity Repository
 * @property {symbol} RoleRepository - Symbol for the Role Repository
 * @property {symbol} PersonRepository - Symbol for the Person Repository
 * @property {symbol} EmploymentRepository - Symbol for the Employment Repository
 * @property {symbol} OpportunityService - Symbol for the Opportunity Service
 * @property {symbol} RoleService - Symbol for the Role Service
 * @property {symbol} RoleMatchingService - Symbol for the Role Matching Service
 * @property {symbol} PersonService - Symbol for the Person Service
 * @property {symbol} EmploymentService - Symbol for the Employment Service
 * @property {symbol} EmployeeApplicationService - Symbol for the Employee Application Service
 * @property {symbol} McpClientService - Symbol for the MCP Client Service
 * @property {symbol} OpenAIService - Symbol for the OpenAI Service
 * @property {symbol} VectorDatabaseService - Symbol for the Vector Database Service
 * @property {symbol} RAGService - Symbol for the RAG Service
 * @property {symbol} CacheService - Symbol for the Cache Service
 * @property {symbol} OptimizedBatchService - Symbol for the Optimized Batch Service
 * @property {symbol} OptimizedSimilarityService - Symbol for the Optimized Similarity Service
 * @property {symbol} TechnicalAuthService - Symbol for the Technical Auth Service
 * @property {symbol} OpportunityController - Symbol for the Opportunity Controller
 * @property {symbol} RoleController - Symbol for the Role Controller
 * @property {symbol} RoleMatchingController - Symbol for the Role Matching Controller
 * @property {symbol} RoleMatchingSSEController - Symbol for the Role Matching SSE Controller
 * @property {symbol} EmployeeController - Symbol for the Employee Controller
 * @property {symbol} PersonController - Symbol for the Person Controller
 * @property {symbol} LookupController - Symbol for the Lookup Controller
 * @property {symbol} McpController - Symbol for the MCP Controller
 * @property {symbol} AIController - Symbol for the AI Controller
 * @property {symbol} AuthController - Symbol for the Auth Controller
 * @returns {object} An object containing symbols for dependency injection
 */
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
  RoleMatchingService: Symbol.for('RoleMatchingService'),
  PersonService: Symbol.for('PersonService'),
  EmploymentService: Symbol.for('EmploymentService'),
  EmployeeApplicationService: Symbol.for('EmployeeApplicationService'),
  McpClientService: Symbol.for('McpClientService'),
  OpenAIService: Symbol.for('OpenAIService'),
  VectorDatabaseService: Symbol.for('VectorDatabaseService'),
  RAGService: Symbol.for('RAGService'),
  CacheService: Symbol.for('CacheService'),
  OptimizedBatchService: Symbol.for('OptimizedBatchService'),
  OptimizedSimilarityService: Symbol.for('OptimizedSimilarityService'),
  TechnicalAuthService: Symbol.for('TechnicalAuthService'),

  // Controllers
  OpportunityController: Symbol.for('OpportunityController'),
  RoleController: Symbol.for('RoleController'),
  RoleMatchingController: Symbol.for('RoleMatchingController'),
  RoleMatchingSSEController: Symbol.for('RoleMatchingSSEController'),
  EmployeeController: Symbol.for('EmployeeController'),
  PersonController: Symbol.for('PersonController'),
  LookupController: Symbol.for('LookupController'),
  McpController: Symbol.for('McpController'),
  AIController: Symbol.for('AIController'),
  AuthController: Symbol.for('AuthController'),
};

/**
 * @description Type representing the database connection using Drizzle ORM with Node.js and PostgreSQL.
 * @type DatabaseType
 * @typedef {NodePgDatabase<typeof schema>} DatabaseType
 * @returns {NodePgDatabase<typeof schema>} The database connection type
 */
export type DatabaseType = NodePgDatabase<typeof schema>;

export { TYPES };

// Export the new presenter types
export * from './presenter.types';

// Export presentation types (schema + computed fields)
export * from './presentation.types';

/**
 * @description Result of an embedding operation.
 * @interface EmbeddingResult
 * @property embedding - The generated embedding vector
 * @property model - The model used to generate the embedding
 * @property usage - Token usage statistics
 * @property usage.promptTokens - Number of tokens in the prompt
 * @property usage.totalTokens - Total number of tokens used
 */
export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

/**
 * @description Result of a chat completion operation.
 * @interface ChatCompletionResult
 * @property content - The generated chat content
 * @property model - The model used to generate the chat content
 * @property usage - Token usage statistics
 * @property usage.promptTokens - Number of tokens in the prompt
 * @property usage.completionTokens - Number of tokens in the completion
 * @property usage.totalTokens - Total number of tokens used
 */
export interface ChatCompletionResult {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * @description Interface for OpenAI service interactions.
 * @interface OpenAIService
 * @method generateCompletion - Generates a text completion based on the provided prompt and options.
 * @param {string} prompt - The input prompt for the completion.
 * @param {object} [options] - Optional parameters for the completion generation.
 * @param {string} [options.model] - The model to use for completion.
 * @param {number} [options.temperature] - The temperature setting for the completion.
 * @param {number} [options.maxTokens] - The maximum number of tokens to generate.
 * @returns {Promise<object>} A promise that resolves to an object containing the generated content, tokens used, and model information.
 */
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