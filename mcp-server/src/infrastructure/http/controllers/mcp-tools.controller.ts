import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { z } from 'zod';
import { TYPES } from '../../../shared/types';
import { McpAnalysisService } from '../../../domain/services/mcp-analysis.service';
import { AnalysisRequest, ResponseEnvelope, McpTool } from '../../../shared/types';

const AnalysisRequestSchema = z.object({
  data: z.string().min(1, 'Data is required'),
  analysisType: z.string().optional(),
  userRole: z.string().optional(),
  urgency: z.string().optional(),
  confidentialityLevel: z.string().optional(),
});

const ConfidenceRequestSchema = z.object({
  data: z.string().min(1, 'Data is required'),
});

/**
 * @swagger
 * tags:
 *   - name: Tools
 *     description: Advanced HR analytics and AI-powered tools
 */
@injectable()
export class McpToolsController {
  constructor(
    @inject(TYPES.McpAnalysisService)
    private readonly analysisService: McpAnalysisService
  ) {}

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
  async getTools(req: Request, res: Response): Promise<void> {
    try {
      const tools: McpTool[] = [
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

      const response: ResponseEnvelope<{ tools: McpTool[] }> = {
        status: 'success',
        data: { tools },
        meta: {
          timestamp: new Date().toISOString(),
          count: tools.length
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
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
  async analyzeData(req: Request, res: Response): Promise<void> {
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

      const analysisRequest: AnalysisRequest = validation.data;
      const result = await this.analysisService.analyzeData(analysisRequest);

      const response: ResponseEnvelope<typeof result> = {
        status: 'success',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          processingTime: result.metadata.processingTime
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
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
  async getConfidence(req: Request, res: Response): Promise<void> {
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

      const response: ResponseEnvelope<typeof result> = {
        status: 'success',
        data: result,
        meta: {
          timestamp: new Date().toISOString()
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
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
  async executeTool(req: Request<{ toolName: string }>, res: Response): Promise<void> {
    try {
      const { toolName } = req.params;
      const { arguments: args } = req.body;

      // Route to appropriate method based on tool name
      switch (toolName) {
        case 'analyze-data':
        case 'analyze_data':
          // Convert legacy format to new format
          const analysisRequest: AnalysisRequest = {
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
    } catch (error: any) {
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
} 