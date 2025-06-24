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
 *     summary: Analyze a person using AI with RAG and MCP integration
 *     description: |
 *       Performs comprehensive AI-powered analysis of a person using Retrieval-Augmented Generation (RAG) 
 *       with vector similarity search and context from similar professionals. The analysis leverages MCP 
 *       (Model Context Protocol) for advanced HR analytics and talent intelligence.
 *       
 *       **Available Analysis Types:**
 *       - `capability_analysis` - Comprehensive assessment of professional capabilities and strengths
 *       - `skill_gap` - Identifies gaps between current skills and market demands or role requirements
 *       - `career_recommendation` - Provides personalized career development and progression recommendations
 *       - `performance_analysis` - Analyzes performance metrics and patterns for improvement insights
 *       - `general` - General AI analysis with basic insights and recommendations
 *       
 *       **User Role Context:**
 *       The analysis is tailored based on the requester's role:
 *       - `hr_manager` - Strategic HR insights, hiring recommendations, team optimization
 *       - `employee` - Personal development, skill building, career guidance
 *       - `executive` - High-level talent intelligence, strategic workforce planning
 *       - `recruiter` - Candidate assessment, role fit analysis, market positioning
 *       - `team_lead` - Team performance, skill distribution, project staffing insights
 *       
 *       **Analysis Features:**
 *       - Vector similarity search for contextual insights from similar professionals
 *       - Market skill context and industry benchmarking
 *       - Confidence scoring and reliability assessment
 *       - Customizable urgency and confidentiality levels
 *       - Comprehensive metadata and processing information
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
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               analysisType:
 *                 type: string
 *                 enum: [capability_analysis, skill_gap, career_recommendation, performance_analysis, general]
 *                 default: general
 *                 description: |
 *                   Type of analysis to perform:
 *                   - `capability_analysis`: Comprehensive professional capability assessment
 *                   - `skill_gap`: Identify skills gaps and development opportunities
 *                   - `career_recommendation`: Personalized career development guidance
 *                   - `performance_analysis`: Performance metrics and improvement insights
 *                   - `general`: Basic AI analysis with general insights
 *                 example: "capability_analysis"
 *               userRole:
 *                 type: string
 *                 enum: [hr_manager, employee, executive, recruiter, team_lead]
 *                 default: hr_manager
 *                 description: |
 *                   Role of the user requesting the analysis (affects perspective and depth):
 *                   - `hr_manager`: Strategic HR insights and recommendations
 *                   - `employee`: Personal development and career guidance
 *                   - `executive`: High-level talent intelligence and strategic insights
 *                   - `recruiter`: Candidate assessment and role fit analysis
 *                   - `team_lead`: Team performance and project staffing insights
 *                 example: "hr_manager"
 *               urgency:
 *                 type: string
 *                 enum: [immediate, standard, strategic]
 *                 default: standard
 *                 description: |
 *                   Urgency level affecting analysis depth and processing priority:
 *                   - `immediate`: Quick analysis for urgent decisions
 *                   - `standard`: Balanced analysis with good depth and speed
 *                   - `strategic`: Comprehensive deep analysis for strategic planning
 *                 example: "standard"
 *               confidentialityLevel:
 *                 type: string
 *                 enum: [public, internal, confidential, restricted]
 *                 default: internal
 *                 description: |
 *                   Confidentiality level for the analysis:
 *                   - `public`: Can be shared openly
 *                   - `internal`: For internal company use only
 *                   - `confidential`: Restricted access, sensitive information
 *                   - `restricted`: Highest security, very limited access
 *                 example: "internal"
 *               includeSimilarPersons:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to include similar persons for contextual analysis and benchmarking
 *                 example: true
 *               includeSkillsContext:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to include market context for skills and industry benchmarking
 *                 example: true
 *               includeConfidenceScore:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to include confidence scoring in the analysis results
 *                 example: true
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     personId:
 *                       type: string
 *                       description: ID of the analyzed person
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     analysisType:
 *                       type: string
 *                       description: Type of analysis performed
 *                       example: "capability_analysis"
 *                     analysis:
 *                       type: string
 *                       description: The comprehensive AI-generated analysis result
 *                       example: "This professional demonstrates strong technical capabilities with expertise in modern web technologies. Key strengths include 5+ years of JavaScript experience, advanced React proficiency, and solid backend development skills..."
 *                     confidence:
 *                       type: object
 *                       description: Confidence scoring for the analysis
 *                       properties:
 *                         score:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 1
 *                           description: Overall confidence score (0-1)
 *                           example: 0.87
 *                         level:
 *                           type: string
 *                           enum: [low, medium, high, very_high]
 *                           description: Confidence level category
 *                           example: "high"
 *                         factors:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Factors affecting confidence
 *                           example: ["Complete skill profile", "Recent experience data", "Similar professionals context"]
 *                     metadata:
 *                       type: object
 *                       description: Analysis metadata and processing information
 *                       properties:
 *                         userRole:
 *                           type: string
 *                           example: "hr_manager"
 *                         urgency:
 *                           type: string
 *                           example: "standard"
 *                         confidentialityLevel:
 *                           type: string
 *                           example: "internal"
 *                         processingTime:
 *                           type: string
 *                           description: Time taken to complete the analysis
 *                           example: "3.2s"
 *                         similarPersonsUsed:
 *                           type: integer
 *                           description: Number of similar persons used for context
 *                           example: 12
 *                         skillsAnalyzed:
 *                           type: integer
 *                           description: Number of skills analyzed
 *                           example: 15
 *                         marketContextIncluded:
 *                           type: boolean
 *                           example: true
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [skill_development, career_path, training, certification]
 *                             description: Type of recommendation
 *                           priority:
 *                             type: string
 *                             enum: [high, medium, low]
 *                             description: Priority level
 *                           description:
 *                             type: string
 *                             description: Detailed recommendation
 *                           timeline:
 *                             type: string
 *                             description: Suggested timeline for implementation
 *                       description: AI-generated recommendations based on the analysis
 *                       example: [
 *                         {
 *                           "type": "skill_development",
 *                           "priority": "high",
 *                           "description": "Consider advancing cloud architecture skills, particularly AWS or Azure",
 *                           "timeline": "3-6 months"
 *                         }
 *                       ]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: When the analysis was performed
 *                       example: "2024-01-15T14:30:00Z"
 *       400:
 *         description: Bad request - missing required fields or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error - analysis failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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