import { Router } from 'express';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';
import { McpController } from '../controllers/mcp.controller';

/**
 * MCP (Model Context Protocol) Routes
 * 
 * This module provides direct access to MCP server capabilities for advanced HR analytics
 * and talent intelligence. These endpoints complement the AI analysis system (/api/v1/ai)
 * by providing specialized tools for:
 * 
 * - Data Analysis: Comprehensive capability assessment, skill gap analysis, performance insights
 * - Report Generation: Customizable reports for different stakeholders and use cases  
 * - Skill Benchmarking: Industry and market comparison for skills and capabilities
 * - Compensation Analysis: Market-based salary and benefits analysis
 * - Confidence Scoring: Reliability assessment for AI-generated insights
 * 
 * Integration with AI Analysis:
 * - The /api/v1/ai/analyze endpoint uses these MCP tools internally
 * - These direct MCP endpoints provide more granular control and specialized features
 * - Both systems share the same analysis types, user roles, and confidentiality levels
 * - Results from both systems are compatible and can be cross-referenced
 * 
 * Authentication & Security:
 * - All endpoints respect the confidentialityLevel parameter
 * - User role affects the depth and perspective of analysis
 * - Processing is optimized based on urgency level
 * 
 * For standard AI analysis of persons, use /api/v1/ai/analyze
 * For specialized HR analytics and custom tools, use these MCP endpoints
 */

const router = Router();
const mcpController = container.get<McpController>(TYPES.McpController);

/**
 * @swagger
 * /api/v1/mcp/tools:
 *   get:
 *     summary: Get list of available MCP tools
 *     description: Retrieves the list of available tools from the MCP server for AI-powered HR analytics and talent intelligence.
 *     tags:
 *       - MCP Tools
 *     responses:
 *       200:
 *         description: Successfully retrieved MCP tools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     tools:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/McpTool'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *       500:
 *         description: Failed to retrieve MCP tools
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/tools', (req, res) => mcpController.getTools(req, res));

/**
 * @swagger
 * /api/v1/mcp/analyze:
 *   post:
 *     summary: Analyze data using MCP AI tools
 *     description: Performs AI-powered data analysis using the dedicated analyze-data endpoint with configurable analysis parameters for HR analytics and talent intelligence.
 *     tags:
 *       - MCP Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: The data to analyze (employee profiles, skills, performance metrics, etc.)
 *                 example: "Employee: John Doe, Skills: JavaScript, Python, React, Experience: 5 years"
 *               analysisType:
 *                 type: string
 *                 enum: [capability_analysis, skill_gap, career_recommendation, performance_analysis]
 *                 default: capability_analysis
 *                 description: The type of analysis to perform
 *               userRole:
 *                 type: string
 *                 enum: [hr_manager, employee, executive, recruiter, team_lead]
 *                 default: hr_manager
 *                 description: The role of the user requesting the analysis
 *               urgency:
 *                 type: string
 *                 enum: [immediate, standard, strategic]
 *                 default: standard
 *                 description: The urgency level of the analysis
 *               confidentialityLevel:
 *                 type: string
 *                 enum: [public, internal, confidential, restricted]
 *                 default: internal
 *                 description: The confidentiality level of the analysis
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                         analysis:
 *                           type: string
 *                           description: The AI-generated analysis result
 *                         metadata:
 *                           type: object
 *                           description: Additional metadata about the analysis
 *                         confidence:
 *                           type: number
 *                           description: Confidence score of the analysis
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *       400:
 *         description: Bad request - data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Analysis failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//@ts-ignore
router.post('/analyze', (req, res) => mcpController.analyzeData(req, res));

/**
 * @swagger
 * /api/v1/mcp/report:
 *   post:
 *     summary: Generate comprehensive reports using MCP AI tools
 *     description: Generates detailed reports using the dedicated generate-report endpoint with customizable report parameters for HR analytics and talent intelligence.
 *     tags:
 *       - MCP Reports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: The data to generate a report for (team performance, skills analysis, etc.)
 *                 example: "Team: Development Team, Members: 15, Skills: Full-stack development, Performance: High"
 *               reportType:
 *                 type: string
 *                 enum: [comprehensive, summary, detailed, executive]
 *                 default: comprehensive
 *                 description: The type of report to generate
 *               userRole:
 *                 type: string
 *                 enum: [hr_manager, employee, executive, recruiter, team_lead]
 *                 default: hr_manager
 *                 description: The role of the user requesting the report
 *               includeMetrics:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to include quantitative metrics in the report
 *               confidentialityLevel:
 *                 type: string
 *                 enum: [public, internal, confidential, restricted]
 *                 default: internal
 *                 description: The confidentiality level of the report
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                         report:
 *                           type: string
 *                           description: The generated report content
 *                         metadata:
 *                           type: object
 *                           description: Report metadata and statistics
 *                         format:
 *                           type: string
 *                           description: Report format information
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *       400:
 *         description: Bad request - data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Report generation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//@ts-ignore
router.post('/report', (req, res) => mcpController.generateReport(req, res));

/**
 * @swagger
 * /api/v1/mcp/skill-benchmarking:
 *   post:
 *     summary: Perform skill benchmarking analysis
 *     description: Performs comprehensive skill benchmarking using the dedicated endpoint to compare skills against industry standards and market trends.
 *     tags:
 *       - MCP Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: The data to perform skill benchmarking on (employee skills, team capabilities, etc.)
 *                 example: "Skills: JavaScript, Python, React, Node.js, AWS, Docker"
 *               industry:
 *                 type: string
 *                 description: The industry to benchmark against (e.g., 'technology', 'finance', 'healthcare')
 *                 example: "technology"
 *               region:
 *                 type: string
 *                 description: The region to benchmark against (e.g., 'north_america', 'europe', 'global')
 *                 example: "north_america"
 *               includeProjections:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to include future skill demand projections in the benchmarking
 *     responses:
 *       200:
 *         description: Skill benchmarking completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                         benchmarking:
 *                           type: string
 *                           description: The skill benchmarking analysis result
 *                         marketComparison:
 *                           type: object
 *                           description: Market comparison data
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Skill development recommendations
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *       400:
 *         description: Bad request - data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Skill benchmarking failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//@ts-ignore
router.post('/skill-benchmarking', (req, res) => mcpController.skillBenchmarking(req, res));

/**
 * @swagger
 * /api/v1/mcp/compensation-analysis:
 *   post:
 *     summary: Perform compensation analysis
 *     description: Performs comprehensive compensation analysis using the dedicated endpoint to analyze salary data against market standards and equity considerations.
 *     tags:
 *       - MCP Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: The data to perform compensation analysis on (salary data, benefits, equity, etc.)
 *                 example: "Position: Senior Developer, Salary: $95000, Benefits: Health, Dental, 401k, Equity: 0.1%"
 *               marketScope:
 *                 type: string
 *                 enum: [national, regional, global, local]
 *                 default: national
 *                 description: The scope of the market to analyze compensation against
 *               includeEquityAnalysis:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to include equity analysis in the compensation analysis
 *     responses:
 *       200:
 *         description: Compensation analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       properties:
 *                         analysis:
 *                           type: string
 *                           description: The compensation analysis result
 *                         marketComparison:
 *                           type: object
 *                           description: Market compensation comparison data
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: Compensation adjustment recommendations
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *       400:
 *         description: Bad request - data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Compensation analysis failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//@ts-ignore
//@ts-ignore
router.post('/compensation-analysis', (req, res) => mcpController.compensationAnalysis(req, res));

/**
 * @swagger
 * /api/v1/mcp/confidence:
 *   post:
 *     summary: Get analysis confidence score
 *     description: Retrieves the confidence score for AI analysis results, providing insights into the reliability and accuracy of the analysis.
 *     tags:
 *       - MCP Analysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: string
 *                 description: The data to get the analysis confidence score for
 *                 example: "Analysis result: Employee shows strong technical skills with 85% proficiency in required technologies"
 *     responses:
 *       200:
 *         description: Confidence analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       $ref: '#/components/schemas/McpAnalysisConfidence'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *       400:
 *         description: Bad request - data is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Confidence analysis failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//@ts-ignore
router.post('/confidence', (req, res) => mcpController.getAnalysisConfidence(req, res));

/**
 * @swagger
 * /api/v1/mcp/execute:
 *   post:
 *     summary: Execute any MCP tool with custom arguments
 *     description: Generic endpoint for executing any available MCP tool with custom arguments. Provides legacy support for the generic tool execution interface.
 *     tags:
 *       - MCP Tools
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolName
 *             properties:
 *               toolName:
 *                 type: string
 *                 description: The name of the MCP tool to execute
 *                 example: "analyze-data"
 *               arguments:
 *                 type: object
 *                 description: The arguments to pass to the tool (varies by tool)
 *                 example:
 *                   data: "Employee performance data"
 *                   analysisType: "capability_analysis"
 *     responses:
 *       200:
 *         description: Tool executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       description: The result of the tool execution (varies by tool)
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *       400:
 *         description: Bad request - tool name is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Tool execution failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
//@ts-ignore
router.post('/execute', (req, res) => mcpController.executeTool(req, res));

/**
 * @swagger
 * /api/v1/mcp/health:
 *   get:
 *     summary: Check MCP server health status
 *     description: Performs a health check on the MCP server to ensure it's running and responsive. Returns connection status and server availability.
 *     tags:
 *       - MCP Health
 *     responses:
 *       200:
 *         description: Health check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 data:
 *                   type: object
 *                   properties:
 *                     healthy:
 *                       type: boolean
 *                       description: Whether the MCP server is healthy
 *                     mcpServer:
 *                       type: string
 *                       enum: [connected, disconnected]
 *                       description: MCP server connection status
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 *       500:
 *         description: Health check failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                 data:
 *                   type: object
 *                   properties:
 *                     healthy:
 *                       type: boolean
 *                       enum: [false]
 *                     message:
 *                       type: string
 *                       description: Error message describing the health check failure
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     requestId:
 *                       type: string
 */
router.get('/health', (req, res) => mcpController.checkHealth(req, res));

export default router; 