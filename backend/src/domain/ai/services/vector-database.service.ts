import { injectable, inject } from 'inversify';
import { DatabaseType } from '../../../shared/types';
import { TYPES } from '../../../shared/types';
import { 
  personEmbeddings, 
  similaritySearches,
  type PersonEmbedding,
  type NewPersonEmbedding,
  type SimilarityResult,
  type EmbeddingMetadata
} from '../../../../db/schema/embeddings.schema';
import { eq, and, desc, sql } from 'drizzle-orm';

@injectable()
export class VectorDatabaseService {
  constructor(
    @inject(TYPES.Database) private db: DatabaseType
  ) {}

  /**
   * Store person embedding in the database
   * @param personId - The ID of the person
   * @param embedding - The embedding vector as an array of numbers
   * @param searchableText - Text to be used for searching
   * @param embeddingType - Type of embedding (e.g., 'profile', 'skills')
   * @param model - The model used for generating the embedding
   * @param metadata - Optional metadata associated with the embedding
   * @returns The stored PersonEmbedding object
   */
  async storePersonEmbedding(
    personId: string,
    embedding: number[],
    searchableText: string,
    embeddingType: string = 'profile',
    model: string = 'text-embedding-3-small',
    metadata?: EmbeddingMetadata
  ): Promise<PersonEmbedding> {
    try {
      // Check if embedding already exists for this person and type
      const existing = await this.db
        .select()
        .from(personEmbeddings)
        .where(
          and(
            eq(personEmbeddings.personId, personId),
            eq(personEmbeddings.embeddingType, embeddingType)
          )
        )
        .limit(1);

      const embeddingData: NewPersonEmbedding = {
        personId,
        embeddingType,
        model,
        dimension: embedding.length,
        embedding: embedding,
        searchableText,
        tokensUsed: Math.ceil(searchableText.length / 4), // Rough estimate
        cost: this.calculateEmbeddingCost(embedding.length, model),
        metadata: metadata ? JSON.stringify(metadata) : null,
      };

      if (existing.length > 0) {
        // Update existing embedding
        const [updated] = await this.db
          .update(personEmbeddings)
          .set({
            ...embeddingData,
            updatedAt: new Date(),
          })
          .where(eq(personEmbeddings.id, existing[0].id))
          .returning();

        return updated;
      } else {
        // Insert new embedding
        const [inserted] = await this.db
          .insert(personEmbeddings)
          .values(embeddingData)
          .returning();

        return inserted;
      }
    } catch (error: any) {
      console.error('Error storing person embedding:', error);
      throw new Error(`Failed to store embedding: ${error.message}`);
    }
  }

  /**
   * Find similar persons using cosine similarity
   * @param queryEmbedding - The embedding vector to compare against
   * @param embeddingType - The type of embedding (e.g., 'profile', 'skills')
   * @param limit - Maximum number of results to return
   * @param similarityThreshold - Minimum similarity score to consider a match
   * @returns An array of SimilarityResult objects containing person IDs and similarity scores
   */
  async findSimilarPersons(
    queryEmbedding: number[],
    embeddingType: string = 'profile',
    limit: number = 10,
    similarityThreshold: number = 0.7
  ): Promise<SimilarityResult[]> {
    try {
      const startTime = Date.now();

      // Convert embedding array to pgvector format
      const embeddingString = `[${queryEmbedding.join(',')}]`;

      // Perform similarity search using pgvector
      const results = await this.db
        .select({
          personId: personEmbeddings.personId,
          similarity: sql<number>`1 - (${personEmbeddings.embedding}::vector <=> ${embeddingString}::vector)`,
          searchableText: personEmbeddings.searchableText,
          metadata: personEmbeddings.metadata,
        })
        .from(personEmbeddings)
        .where(
          and(
            eq(personEmbeddings.embeddingType, embeddingType),
            sql`1 - (${personEmbeddings.embedding}::vector <=> ${embeddingString}::vector) >= ${similarityThreshold}`
          )
        )
        .orderBy(desc(sql`1 - (${personEmbeddings.embedding}::vector <=> ${embeddingString}::vector)`))
        .limit(limit);

      const executionTime = Date.now() - startTime;

      // Transform results to SimilarityResult format
      const similarityResults: SimilarityResult[] = results.map(result => {
        const metadata = result.metadata ? JSON.parse(result.metadata) as EmbeddingMetadata : null;
        
        return {
          personId: result.personId,
          similarity: result.similarity,
          personName: metadata?.personName || 'Unknown',
          email: metadata?.email || '',
          skills: [], // Will be populated by calling service
          technologies: [], // Will be populated by calling service
        };
      });

      // Store search results for analytics
      await this.storeSimilaritySearch(
        queryEmbedding,
        embeddingType,
        'text-embedding-3-small',
        similarityResults,
        limit,
        similarityThreshold,
        executionTime
      );

      return similarityResults;
    } catch (error:any) {
      console.error('Error finding similar persons:', error);
      throw new Error(`Failed to find similar persons: ${error.message}`);
    }
  }

  /**
   * Find similar persons by text query (generates embedding first)
   */
  async findSimilarPersonsByText(
    queryText: string,
    embeddingType: string = 'profile',
    limit: number = 10,
    similarityThreshold: number = 0.7
  ): Promise<SimilarityResult[]> {
    try {
      // This method will be called from a service that has access to OpenAI
      // For now, we'll throw an error indicating that embedding generation is needed
      throw new Error('Text-based similarity search requires embedding generation. Use findSimilarPersonsByTextWithEmbedding instead.');
    } catch (error) {
      console.error('Error in text-based similarity search:', error);
      throw error;
    }
  }

  /**
   * Get person embedding by ID and type
   * @param personId - The ID of the person
   * @param embeddingType - The type of embedding (e.g., 'profile', 'skills')
   * @return The PersonEmbedding object or null if not found
   */
  async getPersonEmbedding(
    personId: string,
    embeddingType: string = 'profile'
  ): Promise<PersonEmbedding | null> {
    try {
      const [embedding] = await this.db
        .select()
        .from(personEmbeddings)
        .where(
          and(
            eq(personEmbeddings.personId, personId),
            eq(personEmbeddings.embeddingType, embeddingType)
          )
        )
        .limit(1);

      return embedding || null;
    } catch (error:any) {
      console.error('Error getting person embedding:', error);
      throw new Error(`Failed to get embedding: ${error.message}`);
    }
  }

  /**
   * Delete person embedding
   * @param personId - The ID of the person
   * @param embeddingType - The type of embedding to delete (default is 'profile')
   * @throws Error if deletion fails
   */
  async deletePersonEmbedding(
    personId: string,
    embeddingType: string = 'profile'
  ): Promise<void> {
    try {
      await this.db
        .delete(personEmbeddings)
        .where(
          and(
            eq(personEmbeddings.personId, personId),
            eq(personEmbeddings.embeddingType, embeddingType)
          )
        );
    } catch (error: any) {
      console.error('Error deleting person embedding:', error);
      throw new Error(`Failed to delete embedding: ${error.message}`);
    }
  }

  /**
   * Get embedding statistics
   * Returns total embeddings, count by type, total cost, and average similarity
   * @returns An object containing statistics about embeddings
   * @throws Error if statistics retrieval fails
   */
  async getEmbeddingStats(): Promise<{
    totalEmbeddings: number;
    embeddingsByType: Record<string, number>;
    totalCost: string;
    averageSimilarity: number;
  }> {
    try {
      // Get total embeddings
      const totalResult = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(personEmbeddings);

      // Get embeddings by type
      const typeResults = await this.db
        .select({
          embeddingType: personEmbeddings.embeddingType,
          count: sql<number>`count(*)`,
        })
        .from(personEmbeddings)
        .groupBy(personEmbeddings.embeddingType);

      // Calculate total cost
      const costResult = await this.db
        .select({
          totalCost: sql<string>`sum(cast(cost as decimal))`,
        })
        .from(personEmbeddings);

      // Get average similarity from recent searches
      const avgSimilarityResult = await this.db
        .select({
          avgSimilarity: sql<number>`avg(cast(execution_time as decimal))`,
        })
        .from(similaritySearches)
        .where(sql`created_at >= now() - interval '7 days'`);

      const embeddingsByType: Record<string, number> = {};
      typeResults.forEach(result => {
        embeddingsByType[result.embeddingType] = result.count;
      });

      return {
        totalEmbeddings: totalResult[0]?.count || 0,
        embeddingsByType,
        totalCost: costResult[0]?.totalCost || '0',
        averageSimilarity: avgSimilarityResult[0]?.avgSimilarity || 0,
      };
    } catch (error: any) {
      console.error('Error getting embedding stats:', error);
      throw new Error(`Failed to get embedding stats: ${error.message}`);
    }
  }

  /**
   * Store similarity search results for analytics
   * @param queryEmbedding - The embedding vector used for the search
   * @param embeddingType - The type of embedding used (e.g., 'profile', 'skills')
   * @param model - The model used for generating the embedding
   * @param results - The results of the similarity search
   * @param limit - The limit of results returned
   * @param similarityThreshold - The threshold for similarity
   * @param executionTime - The time taken to execute the search
   * @throws Error if storing fails
   */
  private async storeSimilaritySearch(
    queryEmbedding: number[],
    embeddingType: string,
    model: string,
    results: SimilarityResult[],
    limit: number,
    similarityThreshold: number,
    executionTime: number
  ): Promise<void> {
    try {
      await this.db.insert(similaritySearches).values({
        queryText: 'Vector similarity search',
        queryEmbedding: JSON.stringify(queryEmbedding),
        embeddingType,
        model,
        results: JSON.stringify(results),
        limit,
        similarityThreshold: similarityThreshold.toString(),
        executionTime: executionTime.toString(),
        tokensUsed: Math.ceil(queryEmbedding.length * 4), // Rough estimate
        cost: this.calculateEmbeddingCost(queryEmbedding.length, model),
      });
    } catch (error) {
      console.error('Error storing similarity search:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Calculate embedding cost based on model and tokens
   * @param tokens - Number of tokens used in the embedding
   * @param model - The model used for generating the embedding
   * @returns The cost as a string formatted to 6 decimal places
   */
  private calculateEmbeddingCost(tokens: number, model: string): string {
    // OpenAI pricing (as of 2024)
    const pricing = {
      'text-embedding-3-small': 0.00002, // $0.00002 per 1K tokens
      'text-embedding-3-large': 0.00013, // $0.00013 per 1K tokens
      'text-embedding-ada-002': 0.0001,  // $0.0001 per 1K tokens
    };

    const rate = pricing[model as keyof typeof pricing] || pricing['text-embedding-3-small'];
    const cost = (tokens / 1000) * rate;
    
    return cost.toFixed(6);
  }
} 