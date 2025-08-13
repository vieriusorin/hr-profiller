import { injectable } from 'inversify';
import Redis from 'ioredis';
import { SimilarityResult } from '../../../../db/schema/embeddings.schema';

export interface EmbeddingCacheData {
  embedding: number[];
  model: string;
  createdAt: string;
  dataHash: string;
}

@injectable()
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      keyPrefix: 'hr_rag:',
      retryStrategy: (times) => Math.min(times * 100, 3000),
      maxRetriesPerRequest: 3,
    });
  }

  /**
   * Cache embedding for a person
   */
  async setEmbedding(
    personId: string, 
    type: string, 
    embedding: number[], 
    model: string,
    dataHash: string,
    ttl: number = 24 * 60 * 60 // 24 hours default
  ): Promise<void> {
    const key = `embedding:${personId}:${type}`;
    const data: EmbeddingCacheData = {
      embedding,
      model,
      createdAt: new Date().toISOString(),
      dataHash
    };
    
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  /**
   * Get cached embedding for a person
   */
  async getEmbedding(personId: string, type: string): Promise<EmbeddingCacheData | null> {
    const key = `embedding:${personId}:${type}`;
    const cached = await this.redis.get(key);
    
    if (!cached) return null;
    
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached embedding:', error);
      await this.redis.del(key);
      return null;
    }
  }

  /**
   * Cache similarity search results
   */
  async setSimilarPersons(
    queryHash: string, 
    results: SimilarityResult[], 
    ttl: number = 60 * 60 // 1 hour default
  ): Promise<void> {
    const key = `similarity:${queryHash}`;
    await this.redis.setex(key, ttl, JSON.stringify(results));
  }

  /**
   * Get cached similarity search results
   */
  async getSimilarPersons(queryHash: string): Promise<SimilarityResult[] | null> {
    const key = `similarity:${queryHash}`;
    const cached = await this.redis.get(key);
    
    if (!cached) return null;
    
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached similarity results:', error);
      await this.redis.del(key);
      return null;
    }
  }

  /**
   * Cache AI analysis results
   */
  async setAnalysis(
    personId: string, 
    analysisType: string, 
    userRole: string,
    analysis: any, 
    ttl: number = 60 * 60 // 1 hour default
  ): Promise<void> {
    const key = `analysis:${personId}:${analysisType}:${userRole}`;
    await this.redis.setex(key, ttl, JSON.stringify(analysis));
  }

  /**
   * Get cached AI analysis
   */
  async getAnalysis(personId: string, analysisType: string, userRole: string): Promise<any | null> {
    const key = `analysis:${personId}:${analysisType}:${userRole}`;
    const cached = await this.redis.get(key);
    
    if (!cached) return null;
    
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached analysis:', error);
      await this.redis.del(key);
      return null;
    }
  }

  /**
   * Invalidate person-related caches when data changes
   */
  async invalidatePersonCaches(personId: string): Promise<void> {
    const patterns = [
      `embedding:${personId}:*`,
      `analysis:${personId}:*`,
      `similarity:*` // Invalidate all similarity searches (could be more targeted)
    ];

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }

  /**
   * Generate hash for query parameters to use as cache key
   */
  generateQueryHash(query: string, limit: number, threshold: number, filters?: any): string {
    const crypto = require('crypto');
    const data = JSON.stringify({ query, limit, threshold, filters });
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * Generate hash for person data to detect changes
   */
  generatePersonDataHash(person: any): string {
    const crypto = require('crypto');
    // Only include fields that affect embeddings
    const relevantData = {
      skills: person.skills,
      technologies: person.technologies,
      education: person.education,
      notes: person.notes,
      personalDescription: person.personalDescription,
      updatedAt: person.updatedAt
    };
    const data = JSON.stringify(relevantData, Object.keys(relevantData).sort());
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      return { healthy: true, latency };
    } catch (error) {
      console.error('Redis health check failed:', error);
      return { healthy: false };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      return { memory: info, keyspace };
    } catch (error) {
      console.error('Error getting Redis stats:', error);
      return null;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}