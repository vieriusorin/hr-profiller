import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../shared/types';
import { McpClientService } from '../../../domain/mcp/services/mcp-client.service';

@injectable()
export class McpController {
  constructor(
    @inject(TYPES.McpClientService) private mcpClientService: McpClientService
  ) {}

  /**
   * GET /api/v1/mcp/tools
   * List available MCP tools
   */
  async getTools(req: Request, res: Response) {
    try {
      const tools = await this.mcpClientService.getAvailableTools();
      res.json({ 
        status: 'success',
        data: { tools },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: 'error',
        data: {
          message: 'Failed to retrieve MCP tools',
          details: error.message 
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  /**
   * POST /api/v1/mcp/analyze
   * Trigger data analysis via MCP
   */
  async analyzeData(req: Request, res: Response) {
    try {
      const { data, analysisType } = req.body;
      
      if (!data) {
        return res.status(400).json({ 
          status: 'error',
          data: { message: 'Data is required' },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      const result = await this.mcpClientService.analyzeData(data, analysisType);
      res.json({ 
        status: 'success',
        data: { result },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: 'error',
        data: {
          message: 'Analysis failed',
          details: error.message 
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  /**
   * POST /api/v1/mcp/report
   * Generate report via MCP
   */
  async generateReport(req: Request, res: Response) {
    try {
      const { reportType, parameters } = req.body;
      
      if (!reportType) {
        return res.status(400).json({ 
          status: 'error',
          data: { message: 'Report type is required' },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      const result = await this.mcpClientService.generateReport(reportType, parameters);
      res.json({ 
        status: 'success',
        data: { result },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: 'error',
        data: {
          message: 'Report generation failed',
          details: error.message 
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  /**
   * POST /api/v1/mcp/execute
   * Execute any MCP tool
   */
  async executeTool(req: Request, res: Response) {
    try {
      const { toolName, arguments: args } = req.body;
      
      if (!toolName) {
        return res.status(400).json({ 
          status: 'error',
          data: { message: 'Tool name is required' },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown'
          }
        });
      }

      const result = await this.mcpClientService.executeTool(toolName, args || {});
      res.json({ 
        status: 'success',
        data: { result },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: 'error',
        data: {
          message: 'Tool execution failed',
          details: error.message 
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }

  /**
   * GET /api/v1/mcp/health
   * Check MCP server health
   */
  async checkHealth(req: Request, res: Response) {
    try {
      const isHealthy = await this.mcpClientService.isHealthy();
      res.json({ 
        status: 'success',
        data: { 
          healthy: isHealthy,
          mcpServer: isHealthy ? 'connected' : 'disconnected'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        status: 'error',
        data: {
          healthy: false,
          message: error.message 
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    }
  }
} 