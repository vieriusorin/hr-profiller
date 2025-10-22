import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../shared/types';
import { RAGService, AnalysisRequest } from '../../../domain/ai/services/rag.service';
import { OpenAIService } from '../../../domain/ai/services/openai.service';
import { VectorDatabaseService } from '../../../domain/ai/services/vector-database.service';

/**
 * @class AIController
 * @description Controller for AI-related endpoints.
 * Handles requests for person analysis, similar person search,
 * embedding generation, and RAG statistics.
 * @method analyzePerson - Analyze a person using RAG.
 * @method findSimilarPersons - Find similar persons using vector similarity search.
 * @method generatePersonEmbedding - Generate embeddings for a specific person.
 * @method generateAllEmbeddings - Generate embeddings for all persons (batch operation).
 * @method getRAGStats - Get RAG system statistics.
 * @method healthCheck - Health check for AI services.
 */
@injectable()
export class AIController {
  constructor(
    @inject(TYPES.RAGService) private ragService: RAGService,
    @inject(TYPES.OpenAIService) private openaiService: OpenAIService,
    @inject(TYPES.VectorDatabaseService) private vectorDbService: VectorDatabaseService
  ) {}

  async analyzePerson(req: Request, res: Response): Promise<void> {
    try {
      const { personId, analysisType, includeSimilarPersons, includeSkillsContext } = req.body;

      if (!personId) {
        res.status(400).json({ error: 'personId is required' });
        return;
      }

      const request: AnalysisRequest = {
        personId,
        analysisType: analysisType || 'general',
        includeSimilarPersons: includeSimilarPersons !== false, // Default to true
        includeSkillsContext: includeSkillsContext || false
      };

      const analysisResult = await this.ragService.analyzePersonWithRAG(request);

      res.json({
        success: true,
        data: {
          personId,
          analysisType: request.analysisType,
          analysis: analysisResult,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('AI analysis failed:', error);
      res.status(500).json({
        error: 'AI analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async findSimilarPersons(req: Request, res: Response): Promise<void> {
    try {
      const { query, limit, similarityThreshold } = req.body;

      if (!query) {
        res.status(400).json({ error: 'query is required' });
        return;
      }

      const searchResult = await this.ragService.findSimilarPersons(
        query,
        limit || 10,
        similarityThreshold || 0.7
      );

      res.json({
        success: true,
        data: searchResult
      });

    } catch (error) {
      console.error('Similar persons search failed:', error);
      res.status(500).json({
        error: 'Similar persons search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async generatePersonEmbedding(req: Request, res: Response): Promise<void> {
    try {
      const { personId, embeddingType } = req.body;

      if (!personId) {
        res.status(400).json({ error: 'personId is required' });
        return;
      }

      await this.ragService.generatePersonEmbedding(personId, embeddingType || 'profile');

      res.json({
        success: true,
        message: `Embedding generated successfully for person ${personId}`,
        data: {
          personId,
          embeddingType: embeddingType || 'profile',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Embedding generation failed:', error);
      res.status(500).json({
        error: 'Embedding generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async generateAllEmbeddings(req: Request, res: Response): Promise<void> {
    try {
      await this.ragService.generateAllPersonEmbeddings();

      res.json({
        success: true,
        message: 'Batch embedding generation completed successfully',
        data: {
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Batch embedding generation failed:', error);
      res.status(500).json({
        error: 'Batch embedding generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getRAGStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.ragService.getRAGStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Failed to get RAG stats:', error);
      res.status(500).json({
        error: 'Failed to get RAG stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.vectorDbService.getEmbeddingStats();

      res.json({
        success: true,
        status: 'healthy',
        services: {
          openai: 'connected',
          vectorDatabase: 'connected',
          embeddings: stats.totalEmbeddings
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI health check failed:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: 'AI services health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 