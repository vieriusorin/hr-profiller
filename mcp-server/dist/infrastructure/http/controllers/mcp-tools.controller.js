"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpToolsController = void 0;
const inversify_1 = require("inversify");
const zod_1 = require("zod");
const types_1 = require("../../../shared/types");
const mcp_analysis_service_1 = require("../../../domain/services/mcp-analysis.service");
const AnalysisRequestSchema = zod_1.z.object({
    data: zod_1.z.string().min(1, 'Data is required'),
    analysisType: zod_1.z.string().optional(),
    userRole: zod_1.z.string().optional(),
    urgency: zod_1.z.string().optional(),
    confidentialityLevel: zod_1.z.string().optional(),
});
const ConfidenceRequestSchema = zod_1.z.object({
    data: zod_1.z.string().min(1, 'Data is required'),
});
/**
 * @swagger
 * tags:
 *   - name: Tools
 *     description: Advanced HR analytics and AI-powered tools
 */
let McpToolsController = class McpToolsController {
    constructor(analysisService) {
        this.analysisService = analysisService;
    }
    /**
     * @swagger
     * /tools:
     *   get:
     *     summary: Get list of available MCP tools
     *     tags: [Tools]
     *     responses:
     *       200:
     *         description: List of available tools
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ResponseEnvelope'
     */
    async getTools(req, res) {
        try {
            const tools = [
                {
                    name: 'analyze_data',
                    description: 'Advanced AI-powered talent analysis with contextual intelligence, market positioning, and strategic recommendations using role-specific AI personas',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'string',
                                description: 'JSON string containing comprehensive person data, similar professionals context, and market intelligence'
                            },
                            analysisType: {
                                type: 'string',
                                description: 'Type of advanced analysis to perform',
                                enum: [
                                    'capability_analysis',
                                    'skill_gap',
                                    'career_recommendation',
                                    'performance_optimization',
                                    'succession_planning',
                                    'diversity_analytics',
                                    'compensation_equity',
                                    'hipo_identification',
                                    'culture_fit',
                                    'retention_risk',
                                    'team_dynamics'
                                ]
                            },
                            userRole: {
                                type: 'string',
                                description: 'User role for contextual AI persona selection',
                                enum: ['hr_manager', 'employee', 'executive', 'recruiter', 'team_lead']
                            },
                            urgency: {
                                type: 'string',
                                description: 'Analysis urgency level affecting AI model selection',
                                enum: ['immediate', 'standard', 'strategic']
                            },
                            confidentialityLevel: {
                                type: 'string',
                                description: 'Data confidentiality level',
                                enum: ['public', 'internal', 'confidential', 'restricted']
                            }
                        },
                        required: ['data']
                    },
                    capabilities: ['advanced_analysis', 'ai_insights', 'contextual_intelligence']
                }
            ];
            const response = {
                status: 'success',
                data: { tools },
                meta: {
                    timestamp: new Date().toISOString(),
                    count: tools.length
                }
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error getting MCP tools:', error);
            res.status(500).json({
                status: 'error',
                data: {
                    message: error.message || 'Failed to get MCP tools',
                    code: 'INTERNAL_ERROR'
                },
                meta: { timestamp: new Date().toISOString() }
            });
        }
    }
    /**
     * @swagger
     * /tools/analyze-data:
     *   post:
     *     summary: Analyze data using AI
     *     tags: [Tools]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AnalysisRequest'
     *     responses:
     *       200:
     *         description: Analysis results
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ResponseEnvelope'
     */
    async analyzeData(req, res) {
        try {
            const validation = AnalysisRequestSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({
                    status: 'error',
                    data: {
                        message: 'Invalid request body',
                        code: 'VALIDATION_ERROR',
                        details: validation.error.format()
                    },
                    meta: { timestamp: new Date().toISOString() }
                });
                return;
            }
            const analysisRequest = validation.data;
            const result = await this.analysisService.analyzeData(analysisRequest);
            const response = {
                status: 'success',
                data: result,
                meta: {
                    timestamp: new Date().toISOString(),
                    processingTime: result.metadata.processingTime
                }
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error analyzing data:', error);
            res.status(500).json({
                status: 'error',
                data: {
                    message: error.message || 'Analysis failed',
                    code: 'ANALYSIS_ERROR'
                },
                meta: { timestamp: new Date().toISOString() }
            });
        }
    }
    /**
     * @swagger
     * /confidence:
     *   post:
     *     summary: Get analysis confidence score
     *     tags: [Analytics]
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
     *                 description: Data to analyze for confidence
     *     responses:
     *       200:
     *         description: Confidence analysis results
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ResponseEnvelope'
     */
    async getConfidence(req, res) {
        try {
            const validation = ConfidenceRequestSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({
                    status: 'error',
                    data: {
                        message: 'Invalid request body',
                        code: 'VALIDATION_ERROR',
                        details: validation.error.format()
                    },
                    meta: { timestamp: new Date().toISOString() }
                });
                return;
            }
            const { data } = validation.data;
            const result = await this.analysisService.getAnalysisConfidence(data);
            const response = {
                status: 'success',
                data: result,
                meta: {
                    timestamp: new Date().toISOString()
                }
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error getting confidence:', error);
            res.status(500).json({
                status: 'error',
                data: {
                    message: error.message || 'Confidence analysis failed',
                    code: 'CONFIDENCE_ERROR'
                },
                meta: { timestamp: new Date().toISOString() }
            });
        }
    }
    /**
     * Execute legacy tool (for backward compatibility)
     */
    async executeTool(req, res) {
        try {
            const { toolName } = req.params;
            const { arguments: args } = req.body;
            // Route to appropriate method based on tool name
            switch (toolName) {
                case 'analyze-data':
                case 'analyze_data':
                    // Convert legacy format to new format
                    const analysisRequest = {
                        data: args.data,
                        analysisType: args.analysisType,
                        userRole: args.userRole,
                        urgency: args.urgency,
                        confidentialityLevel: args.confidentialityLevel
                    };
                    const result = await this.analysisService.analyzeData(analysisRequest);
                    res.status(200).json({
                        content: result,
                        isError: false,
                        metadata: {
                            executionTime: result.metadata.processingTime,
                            tokensUsed: result.metadata.tokensUsed,
                            modelUsed: result.metadata.modelUsed,
                            confidence: result.confidence,
                            timestamp: result.metadata.timestamp
                        }
                    });
                    break;
                default:
                    res.status(404).json({
                        status: 'error',
                        data: {
                            message: `Tool '${toolName}' not found`,
                            code: 'TOOL_NOT_FOUND'
                        },
                        meta: { timestamp: new Date().toISOString() }
                    });
            }
        }
        catch (error) {
            console.error('Error executing tool:', error);
            res.status(500).json({
                content: null,
                isError: true,
                error: error.message || 'Tool execution failed',
                metadata: {
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
};
exports.McpToolsController = McpToolsController;
exports.McpToolsController = McpToolsController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.McpAnalysisService)),
    __metadata("design:paramtypes", [mcp_analysis_service_1.McpAnalysisService])
], McpToolsController);
