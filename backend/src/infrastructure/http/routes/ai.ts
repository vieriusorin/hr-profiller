import { Router } from 'express';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';
import { AIController } from '../controllers/ai.controller';

const router = Router();
const aiController = container.get<AIController>(TYPES.AIController);

/**
 * @swagger
 * /api/v1/ai/analyze:
 *   post:
 *     summary: Analyze a person using AI with RAG
 *     description: Performs AI-powered analysis of a person using Retrieval-Augmented Generation (RAG) with vector similarity search and context from similar professionals.
 *     tags:
 *       - AI Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personId
 *             properties:
 *               personId:
 *                 type: string
 *                 description: ID of the person to analyze
 *               analysisType:
 *                 type: string
 *                 enum: [capability_analysis, skill_gap, career_recommendation, general]
 *                 default: general
 *                 description: Type of analysis to perform
 *               includeSimilarPersons:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to include similar persons for context
 *               includeSkillsContext:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to include market context for skills
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     personId:
 *                       type: string
 *                     analysisType:
 *                       type: string
 *                     analysis:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/analyze', (req, res) => aiController.analyzePerson(req, res));

/**
 * @swagger
 * /api/v1/ai/similar:
 *   post:
 *     summary: Find similar persons using vector similarity search
 *     description: Searches for persons similar to the given query using vector embeddings and cosine similarity.
 *     tags:
 *       - AI Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Text query to find similar persons
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: Maximum number of results to return
 *               similarityThreshold:
 *                 type: number
 *                 default: 0.7
 *                 minimum: 0
 *                 maximum: 1
 *                 description: Minimum similarity score (0-1)
 *     responses:
 *       200:
 *         description: Similar persons found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     persons:
 *                       type: array
 *                       items:
 *                         type: object
 *                     query:
 *                       type: string
 *                     metadata:
 *                       type: object
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/similar', (req, res) => aiController.findSimilarPersons(req, res));

/**
 * @swagger
 * /api/v1/ai/embeddings/generate:
 *   post:
 *     summary: Generate embeddings for a specific person
 *     description: Generates and stores vector embeddings for a person's profile data.
 *     tags:
 *       - Embeddings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personId
 *             properties:
 *               personId:
 *                 type: string
 *                 description: ID of the person to generate embeddings for
 *               embeddingType:
 *                 type: string
 *                 default: profile
 *                 description: Type of embedding to generate
 *     responses:
 *       200:
 *         description: Embedding generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/embeddings/generate', (req, res) => aiController.generatePersonEmbedding(req, res));

/**
 * @swagger
 * /api/v1/ai/embeddings/generate-all:
 *   post:
 *     summary: Generate embeddings for all persons
 *     description: Batch operation to generate embeddings for all persons in the database.
 *     tags:
 *       - Embeddings
 *     responses:
 *       200:
 *         description: Batch embedding generation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.post('/embeddings/generate-all', (req, res) => aiController.generateAllEmbeddings(req, res));

/**
 * @swagger
 * /api/v1/ai/stats:
 *   get:
 *     summary: Get RAG system statistics
 *     description: Returns statistics about the RAG system including embeddings, searches, and costs.
 *     tags:
 *       - AI Analysis
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     embeddings:
 *                       type: object
 *                     searches:
 *                       type: object
 *                     costs:
 *                       type: object
 *       500:
 *         description: Internal server error
 */
router.get('/stats', (req, res) => aiController.getRAGStats(req, res));

/**
 * @swagger
 * /api/v1/ai/health:
 *   get:
 *     summary: Health check for AI services
 *     description: Checks the health status of AI services including OpenAI and vector database connections.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: AI services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 services:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: AI services are unhealthy
 */
router.get('/health', (req, res) => aiController.healthCheck(req, res));

export default router; 