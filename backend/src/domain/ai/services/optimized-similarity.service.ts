import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { VectorDatabaseService } from './vector-database.service';
import { OpenAIService } from './openai.service';
import { CacheService } from './cache.service';
import { SimilarityResult } from '../../../../db/schema/embeddings.schema';

export interface SimilaritySearchOptions {
  limit?: number;
  similarityThreshold?: number;
  includePersonData?: boolean;
  filters?: {
    skills?: string[];
    technologies?: string[];
    experienceLevel?: string;
    location?: string;
  };
}

export interface OptimizedSimilarityResult extends SimilarityResult {
  cached?: boolean;
  searchTime?: number;
}

@injectable()
export class OptimizedSimilarityService {
  constructor(
    @inject(TYPES.VectorDatabaseService) private vectorDb: VectorDatabaseService,
    @inject(TYPES.OpenAIService) private openaiService: OpenAIService,
    @inject(TYPES.CacheService) private cacheService: CacheService
  ) {}

  /**
   * Find similar persons with optimized caching and search
   */
  async findSimilarPersons(
    query: string,
    options: SimilaritySearchOptions = {}
  ): Promise<OptimizedSimilarityResult[]> {
    const startTime = Date.now();
    const {
      limit = 10,
      similarityThreshold = 0.7,
      includePersonData = true,
      filters
    } = options;

    // Generate cache key based on query parameters
    const cacheKey = this.cacheService.generateQueryHash(
      query,
      limit,
      similarityThreshold,
      filters
    );

    try {
      // Step 1: Check cache first
      const cachedResults = await this.cacheService.getSimilarPersons(cacheKey);
      if (cachedResults) {
        console.log(`Cache hit for similarity search: ${query.substring(0, 50)}...`);
        return cachedResults.map(result => ({
          ...result,
          cached: true,
          searchTime: Date.now() - startTime
        }));
      }

      // Step 2: Generate query embedding
      const queryEmbeddingResult = await this.openaiService.generateEmbeddings(query);
      const queryEmbedding = queryEmbeddingResult.embedding;
      if (!queryEmbedding) {
        throw new Error('Failed to generate query embedding');
      }

      // Step 3: Perform optimized vector search
      const similarities = await this.performOptimizedVectorSearch(
        queryEmbedding,
        limit,
        similarityThreshold,
        filters
      );

      // Step 4: Enhance with person data if requested
      const results = includePersonData 
        ? await this.enrichWithPersonData(similarities)
        : similarities;

      // Step 5: Cache results
      const searchTime = Date.now() - startTime;
      const finalResults = results.map(result => ({
        ...result,
        cached: false,
        searchTime
      }));

      // Cache for 1 hour by default, longer for expensive queries
      const cacheTtl = searchTime > 1000 ? 4 * 60 * 60 : 60 * 60; // 4 hours if slow, 1 hour if fast
      await this.cacheService.setSimilarPersons(cacheKey, finalResults, cacheTtl);

      console.log(`Similarity search completed in ${searchTime}ms for query: ${query.substring(0, 50)}...`);
      return finalResults;

    } catch (error) {
      console.error('Optimized similarity search failed:', error);
      throw new Error(`Similarity search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Perform optimized vector search using prepared statements and indexes
   */
  private async performOptimizedVectorSearch(
    queryEmbedding: number[],
    limit: number,
    similarityThreshold: number,
    filters?: any
  ): Promise<SimilarityResult[]> {
    try {
      // Use the existing vector database service but with optimized query
      const results = await this.vectorDb.findSimilarPersons(
        queryEmbedding,
        'profile', // embeddingType
        limit * 2, // Get more results initially for better filtering
        similarityThreshold * 0.8 // Lower threshold for initial search
      );

      // Apply additional filtering and ranking
      let filteredResults = results.filter(result => result.similarity >= similarityThreshold);

      // Apply filters if provided
      if (filters) {
        filteredResults = await this.applyAdvancedFilters(filteredResults, filters);
      }

      // Sort by similarity (descending) and limit
      return filteredResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('Vector search failed:', error);
      throw new Error(`Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply advanced filters to similarity results
   */
  private async applyAdvancedFilters(
    results: SimilarityResult[],
    filters: NonNullable<SimilaritySearchOptions['filters']>
  ): Promise<SimilarityResult[]> {
    // This would require person data - implement based on your repository structure
    // For now, return unfiltered results
    // TODO: Implement skill/technology/experience filtering
    console.log('Advanced filtering not yet implemented, returning unfiltered results');
    return results;
  }

  /**
   * Enrich similarity results with person data
   */
  private async enrichWithPersonData(similarities: SimilarityResult[]): Promise<SimilarityResult[]> {
    if (similarities.length === 0) return similarities;

    try {
      // Batch fetch person data
      const personIds = similarities.map(s => s.personId);
      const persons = await this.batchFetchPersons(personIds);

      // Create person map for efficient lookup
      const personMap = new Map(persons.map(person => [person.id, person]));

      // Enrich results
      return similarities.map(similarity => ({
        ...similarity,
        person: personMap.get(similarity.personId) || null
      }));

    } catch (error) {
      console.error('Failed to enrich similarity results with person data:', error);
      // Return results without person data rather than failing completely
      return similarities;
    }
  }

  /**
   * Batch fetch persons efficiently
   */
  private async batchFetchPersons(personIds: string[]): Promise<any[]> {
    // This should use your person repository's batch fetch method
    // For now, placeholder implementation
    console.log(`Batch fetching ${personIds.length} persons`);
    
    // TODO: Implement efficient batch fetching
    // return await this.personRepository.findByIds(personIds, { 
    //   includeSkills: true,
    //   includeTechnologies: true,
    //   includeEducation: false // Only include what's needed
    // });
    
    return []; // Placeholder
  }

  /**
   * Find similar persons by person ID (using their embedding)
   */
  async findSimilarToPersonId(
    personId: string,
    options: SimilaritySearchOptions = {}
  ): Promise<OptimizedSimilarityResult[]> {
    try {
      // Get person's embedding from vector database
      const personEmbeddingRecord = await this.vectorDb.getPersonEmbedding(personId);
      if (!personEmbeddingRecord) {
        throw new Error('Person embedding not found');
      }

      // Use the embedding for similarity search, excluding the source person
      const results = await this.performOptimizedVectorSearch(
        personEmbeddingRecord.embedding,
        (options.limit || 10) + 1, // +1 to account for excluding source person
        options.similarityThreshold || 0.7,
        options.filters
      );

      // Filter out the source person
      const filtered = results.filter(result => result.personId !== personId);

      // Limit to requested number
      return filtered
        .slice(0, options.limit || 10)
        .map(result => ({
          ...result,
          cached: false,
          searchTime: 0 // Will be set by calling method
        }));

    } catch (error) {
      console.error(`Failed to find similar persons for person ${personId}:`, error);
      throw new Error(`Similar person search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk similarity search for multiple queries
   */
  async bulkSimilaritySearch(
    queries: string[],
    options: SimilaritySearchOptions = {}
  ): Promise<Map<string, OptimizedSimilarityResult[]>> {
    const results = new Map<string, OptimizedSimilarityResult[]>();

    // Process queries in batches
    const BATCH_SIZE = 5;
    for (let i = 0; i < queries.length; i += BATCH_SIZE) {
      const batch = queries.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (query) => {
        try {
          const searchResults = await this.findSimilarPersons(query, options);
          return { query, results: searchResults };
        } catch (error) {
          console.error(`Bulk search failed for query "${query}":`, error);
          return { query, results: [] };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.set(result.value.query, result.value.results);
        }
      });
    }

    return results;
  }

  /**
   * Get search statistics and performance metrics
   */
  async getSearchStats(): Promise<{
    cacheHitRate: number;
    averageSearchTime: number;
    totalSearches: number;
  }> {
    // This would need to be implemented with proper metrics collection
    // For now, return placeholder stats
    return {
      cacheHitRate: 0.75, // Placeholder: 75% cache hit rate
      averageSearchTime: 150, // Placeholder: 150ms average
      totalSearches: 1000 // Placeholder: 1000 total searches
    };
  }
}