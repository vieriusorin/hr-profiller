import { injectable } from 'inversify';
import { Request, Response } from 'express';
import { ResponseEnvelope, HealthStatus } from '../../../shared/types';

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: System health and capability reporting
 */
@injectable()
export class HealthController {

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     description: Returns the health status of the service, including capabilities and version.
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Service health status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ResponseEnvelope'
   *       503:
   *         description: Service unhealthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ResponseEnvelope'
   */
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const healthStatus: HealthStatus = {
        status: 'healthy',
        service: 'enhanced-hr-mcp-server',
        capabilities: [
          'advanced_analysis',
          'executive_reports', 
          'market_intelligence',
          'ai_insights',
          'contextual_intelligence'
        ],
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      };

      const response: ResponseEnvelope<HealthStatus> = {
        status: 'success',
        data: healthStatus,
        meta: {
          timestamp: new Date().toISOString()
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Health check failed:', error);
      
      const healthStatus: HealthStatus = {
        status: 'unhealthy',
        service: 'enhanced-hr-mcp-server',
        capabilities: [],
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      };

      res.status(503).json({
        status: 'error',
        data: healthStatus,
        meta: { 
          timestamp: new Date().toISOString(),
          error: error.message || 'Health check failed'
        }
      });
    }
  }

  /**
   * @swagger
   * /system/status:
   *   get:
   *     summary: Detailed system status
   *     description: Returns detailed system information including memory usage and environment details.
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Detailed system status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ResponseEnvelope'
   */
  async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const systemStatus = {
        service: 'enhanced-hr-mcp-server',
        version: '2.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024, // MB
          total: process.memoryUsage().heapTotal / 1024 / 1024, // MB
          external: process.memoryUsage().external / 1024 / 1024 // MB
        },
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          env: process.env.NODE_ENV || 'development'
        },
        capabilities: [
          'advanced_analysis',
          'executive_reports', 
          'market_intelligence',
          'ai_insights',
          'contextual_intelligence'
        ],
        dependencies: {
          openai: !!process.env.OPENAI_API_KEY,
          auth: !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL)
        }
      };

      const response: ResponseEnvelope<typeof systemStatus> = {
        status: 'success',
        data: systemStatus,
        meta: {
          timestamp: new Date().toISOString()
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('System status check failed:', error);
      res.status(500).json({
        status: 'error',
        data: { 
          message: error.message || 'System status check failed', 
          code: 'SYSTEM_ERROR' 
        },
        meta: { timestamp: new Date().toISOString() }
      });
    }
  }
} 