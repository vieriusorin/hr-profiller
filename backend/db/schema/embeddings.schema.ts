import { pgTable, uuid, timestamp, text, varchar, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { people } from './people.schema';

/**
 * Person Embeddings table
 * 
 * @description
 * This table stores vector embeddings for person profiles using pgvector.
 * Each person can have multiple embeddings for different purposes:
 * - Profile embedding (skills, technologies, education)
 * - Skill-specific embeddings
 * - Technology-specific embeddings
 * 
 * The embedding column uses pgvector's vector type for similarity search.
 */
export const personEmbeddings = pgTable('person_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id')
    .references(() => people.id, { onDelete: 'cascade' })
    .notNull(),
  
  // Embedding metadata
  embeddingType: varchar('embedding_type', { length: 50 }).notNull(), // 'profile', 'skills', 'technologies', etc.
  model: varchar('model', { length: 100 }).notNull(), // OpenAI model used
  dimension: integer('dimension').notNull(), // Vector dimension
  
  // The actual embedding vector (pgvector type)
  embedding: text('embedding').notNull(), // JSON string of the vector
  
  // Searchable text that was embedded
  searchableText: text('searchable_text').notNull(),
  
  // Usage tracking
  tokensUsed: integer('tokens_used'),
  cost: varchar('cost', { length: 20 }), // Cost in USD
  
  // Metadata
  metadata: text('metadata'), // JSON string for additional data
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Similarity Search Results table
 * 
 * @description
 * This table stores similarity search results for caching and analytics.
 * It helps track which searches are performed and their results.
 */
export const similaritySearches = pgTable('similarity_searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Search parameters
  queryText: text('query_text').notNull(),
  queryEmbedding: text('query_embedding').notNull(), // JSON string of query vector
  embeddingType: varchar('embedding_type', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  
  // Search results (stored as JSON)
  results: text('results').notNull(), // JSON array of person IDs with similarity scores
  
  // Search metadata
  limit: integer('limit').default(10),
  similarityThreshold: varchar('similarity_threshold', { length: 20 }),
  executionTime: varchar('execution_time', { length: 20 }), // in milliseconds
  
  // Usage tracking
  tokensUsed: integer('tokens_used'),
  cost: varchar('cost', { length: 20 }),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Zod schemas for type safety
export const PersonEmbeddingInsertSchema = createInsertSchema(personEmbeddings);
export const PersonEmbeddingSelectSchema = createSelectSchema(personEmbeddings);
export const SimilaritySearchInsertSchema = createInsertSchema(similaritySearches);
export const SimilaritySearchSelectSchema = createSelectSchema(similaritySearches);

// Type exports
export type PersonEmbedding = z.infer<typeof PersonEmbeddingSelectSchema>;
export type NewPersonEmbedding = z.infer<typeof PersonEmbeddingInsertSchema>;
export type SimilaritySearch = z.infer<typeof SimilaritySearchSelectSchema>;
export type NewSimilaritySearch = z.infer<typeof SimilaritySearchInsertSchema>;

// Interface for similarity search results
export interface SimilarityResult {
  personId: string;
  similarity: number;
  personName: string;
  email: string;
  skills: string[];
  technologies: string[];
}

// Interface for embedding metadata
export interface EmbeddingMetadata {
  personName: string;
  email: string;
  skillsCount: number;
  technologiesCount: number;
  educationCount: number;
  lastUpdated: string;
} 