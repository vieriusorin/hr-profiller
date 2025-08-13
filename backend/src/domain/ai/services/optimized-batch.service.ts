import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { OpenAIService } from './openai.service';
import { CacheService } from './cache.service';

export interface BatchEmbeddingRequest {
  personId: string;
  text: string;
  currentHash: string;
}

export interface BatchEmbeddingResult {
  personId: string;
  embedding: number[] | null;
  error?: string;
  cached?: boolean;
}

@injectable()
export class OptimizedBatchService {
  private readonly BATCH_SIZE = 50; // OpenAI allows up to 2048, but we'll be conservative
  private readonly CONCURRENT_BATCHES = 3; // Process multiple batches concurrently
  private readonly MAX_RETRY_ATTEMPTS = 3;

  constructor(
    @inject(TYPES.OpenAIService) private openaiService: OpenAIService,
    @inject(TYPES.CacheService) private cacheService: CacheService
  ) {}

  /**
   * Process multiple persons with optimized batching and caching
   */
  async generateEmbeddingsBatch(requests: BatchEmbeddingRequest[]): Promise<BatchEmbeddingResult[]> {
    console.log(`Processing ${requests.length} embedding requests with optimization`);

    // Step 1: Check cache for existing embeddings
    const { cachedResults, uncachedRequests } = await this.checkCacheForBatch(requests);
    
    console.log(`Found ${cachedResults.length} cached embeddings, processing ${uncachedRequests.length} new ones`);

    if (uncachedRequests.length === 0) {
      return cachedResults;
    }

    // Step 2: Process uncached requests in optimized batches
    const newResults = await this.processUncachedBatch(uncachedRequests);

    // Step 3: Cache new results
    await this.cacheNewResults(newResults);

    // Step 4: Combine and return all results
    return [...cachedResults, ...newResults];
  }

  /**
   * Check cache for existing valid embeddings
   */
  private async checkCacheForBatch(requests: BatchEmbeddingRequest[]): Promise<{
    cachedResults: BatchEmbeddingResult[];
    uncachedRequests: BatchEmbeddingRequest[];
  }> {
    const cachedResults: BatchEmbeddingResult[] = [];
    const uncachedRequests: BatchEmbeddingRequest[] = [];

    // Check cache in parallel
    const cacheChecks = requests.map(async (request) => {
      try {
        const cached = await this.cacheService.getEmbedding(request.personId, 'profile');
        
        // Check if cache is still valid (data hasn't changed)
        if (cached && cached.dataHash === request.currentHash) {
          return {
            request,
            cached: true,
            result: {
              personId: request.personId,
              embedding: cached.embedding,
              cached: true
            }
          };
        } else {
          // Cache miss or stale data
          return {
            request,
            cached: false,
            result: null
          };
        }
      } catch (error) {
        console.error(`Cache check failed for person ${request.personId}:`, error);
        return {
          request,
          cached: false,
          result: null
        };
      }
    });

    const results = await Promise.allSettled(cacheChecks);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.cached && result.value.result) {
          cachedResults.push(result.value.result);
        } else {
          uncachedRequests.push(result.value.request);
        }
      } else {
        // If cache check failed, add to uncached
        console.error('Cache check promise failed:', result.reason);
      }
    });

    return { cachedResults, uncachedRequests };
  }

  /**
   * Process uncached requests with optimized batching
   */
  private async processUncachedBatch(requests: BatchEmbeddingRequest[]): Promise<BatchEmbeddingResult[]> {
    const results: BatchEmbeddingResult[] = [];
    
    // Split into batches
    const batches: BatchEmbeddingRequest[][] = [];
    for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
      batches.push(requests.slice(i, i + this.BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches with ${this.CONCURRENT_BATCHES} concurrent workers`);

    // Process batches with controlled concurrency
    for (let i = 0; i < batches.length; i += this.CONCURRENT_BATCHES) {
      const concurrentBatches = batches.slice(i, i + this.CONCURRENT_BATCHES);
      
      const batchPromises = concurrentBatches.map(batch => 
        this.processSingleBatch(batch).catch(error => {
          console.error('Batch processing failed:', error);
          // Return error results for the batch
          return batch.map(req => ({
            personId: req.personId,
            embedding: null,
            error: `Batch processing failed: ${error.message}`
          }));
        })
      );

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          console.error('Batch promise failed:', result.reason);
        }
      });
    }

    return results;
  }

  /**
   * Process a single batch with retry logic
   */
  private async processSingleBatch(batch: BatchEmbeddingRequest[]): Promise<BatchEmbeddingResult[]> {
    const texts = batch.map(req => req.text);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`Processing batch of ${batch.length} items (attempt ${attempt})`);
        
        // Use OpenAI batch embedding API
        const embeddingResults = await this.openaiService.generateEmbeddingsBatch(texts);
        
        // Map results back to persons, extracting just the embedding arrays
        const results: BatchEmbeddingResult[] = batch.map((request, index) => {
          const embeddingResult = embeddingResults[index];
          return {
            personId: request.personId,
            embedding: embeddingResult?.embedding || null,
            error: embeddingResult?.embedding ? undefined : 'Failed to generate embedding'
          };
        });

        console.log(`Successfully processed batch of ${batch.length} items`);
        return results;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Batch processing attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    console.error(`All retry attempts failed for batch of ${batch.length} items`);
    return batch.map(request => ({
      personId: request.personId,
      embedding: null,
      error: `Failed after ${this.MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`
    }));
  }

  /**
   * Cache newly generated embeddings
   */
  private async cacheNewResults(results: BatchEmbeddingResult[]): Promise<void> {
    const cachePromises = results
      .filter(result => result.embedding && !result.error)
      .map(async (result) => {
        try {
          // Find the original request to get the data hash
          const request = result as any; // We need to pass through the hash
          await this.cacheService.setEmbedding(
            result.personId,
            'profile',
            result.embedding!,
            'text-embedding-3-small', // Should be configurable
            request.currentHash || 'unknown',
            24 * 60 * 60 // 24 hours TTL
          );
        } catch (error) {
          console.error(`Failed to cache embedding for person ${result.personId}:`, error);
        }
      });

    await Promise.allSettled(cachePromises);
    console.log(`Cached ${cachePromises.length} new embeddings`);
  }

  /**
   * Generate embeddings for all persons with optimization
   */
  async generateAllPersonEmbeddings(persons: any[]): Promise<{
    successful: number;
    failed: number;
    cached: number;
    errors: string[];
  }> {
    console.log(`Starting optimized batch processing for ${persons.length} persons`);
    
    // Prepare requests with data hashes
    const requests: BatchEmbeddingRequest[] = persons.map(person => ({
      personId: person.id,
      text: this.createPersonText(person),
      currentHash: this.cacheService.generatePersonDataHash(person)
    }));

    // Process in optimized batches
    const results = await this.generateEmbeddingsBatch(requests);

    // Analyze results
    const successful = results.filter(r => r.embedding && !r.error).length;
    const cached = results.filter(r => r.cached).length;
    const failed = results.filter(r => !r.embedding || r.error).length;
    const errors = results.filter(r => r.error).map(r => r.error!);

    console.log(`Batch processing complete: ${successful} successful, ${cached} cached, ${failed} failed`);

    return {
      successful: successful - cached, // Don't count cached as newly successful
      failed,
      cached,
      errors
    };
  }

  /**
   * Create text representation of person (should match RAG service implementation)
   */
  private createPersonText(person: any): string {
    const parts = [];
    
    if (person.firstName || person.lastName) {
      parts.push(`Name: ${[person.firstName, person.lastName].filter(Boolean).join(' ')}`);
    }
    
    if (person.email) {
      parts.push(`Email: ${person.email}`);
    }
    
    if (person.personalDescription) {
      parts.push(`Description: ${person.personalDescription}`);
    }
    
    if (person.skills?.length > 0) {
      const skillsText = person.skills
        .map((skill: any) => `${skill.name}${skill.level ? ` (${skill.level})` : ''}`)
        .join(', ');
      parts.push(`Skills: ${skillsText}`);
    }
    
    if (person.technologies?.length > 0) {
      const techText = person.technologies
        .map((tech: any) => `${tech.name}${tech.level ? ` (${tech.level})` : ''}`)
        .join(', ');
      parts.push(`Technologies: ${techText}`);
    }
    
    if (person.education?.length > 0) {
      const eduText = person.education
        .map((edu: any) => `${edu.degree} in ${edu.field} from ${edu.institution}${edu.year ? ` (${edu.year})` : ''}`)
        .join('; ');
      parts.push(`Education: ${eduText}`);
    }
    
    if (person.notes) {
      parts.push(`Notes: ${person.notes}`);
    }
    
    return parts.join('\n');
  }
}