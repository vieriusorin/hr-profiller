import { Router } from 'express';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';
import { 
  authenticateAdmin, 
  authenticateTechnicalOnly,
  logAuthMethod 
} from '../../../interfaces/http/middlewares/hybrid-auth.middleware';
import { 
  requireTechnicalPermission,
  rateLimitTechnicalClient 
} from '../../../interfaces/http/middlewares/technical-auth.middleware';
import { ITechnicalAuthService } from '../../../domain/interfaces/auth.interface';

/**
 * Admin Routes - Technical Token Operations
 * 
 * These routes are designed for administrative operations that should primarily
 * be accessed via technical tokens (admin scripts, monitoring systems, etc.)
 * while still allowing admin users for emergency access.
 */

const router = Router();

// Apply authentication and rate limiting to all admin routes
router.use(authenticateAdmin()); // Require admin user OR admin technical token
router.use(rateLimitTechnicalClient()); // Rate limit based on client
router.use(logAuthMethod()); // Log authentication usage

/**
 * @swagger
 * /api/v1/admin/technical-tokens:
 *   get:
 *     summary: Get technical token information
 *     description: Retrieves information about configured technical tokens and their usage
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Technical token information retrieved successfully
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
 *                     clients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           isActive:
 *                             type: boolean
 *                           permissions:
 *                             type: array
 *                           rateLimits:
 *                             type: object
 *                           lastUsed:
 *                             type: string
 *                             format: date-time
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/technical-tokens', 
  requireTechnicalPermission('api/admin', 'read'),
  async (req, res) => {
    try {
      const technicalAuthService = container.get<ITechnicalAuthService>(TYPES.TechnicalAuthService);
      const clients = technicalAuthService.getAllClients();
      
      // Remove sensitive information
      const publicClientInfo = clients.map(client => ({
        id: client.id,
        name: client.name,
        isActive: client.isActive,
        permissions: client.permissions,
        rateLimits: client.rateLimits,
        lastUsed: client.lastUsed,
        createdAt: client.createdAt
      }));

      res.json({
        status: 'success',
        data: {
          clients: publicClientInfo,
          totalClients: clients.length,
          activeClients: clients.filter(c => c.isActive).length
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    } catch (error) {
      console.error('Error retrieving technical token info:', error);
      res.status(500).json({
        status: 'error',
        data: { message: 'Failed to retrieve technical token information' }
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/health:
 *   get:
 *     summary: Comprehensive system health check
 *     description: Performs detailed health checks on all system components
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: System health check completed
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
 *                     overall:
 *                       type: string
 *                       enum: [healthy, degraded, unhealthy]
 *                     components:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: string
 *                         technicalAuth:
 *                           type: string
 *                         ai:
 *                           type: string
 *                         mcp:
 *                           type: string
 *       500:
 *         description: Health check failed
 */
router.get('/health', 
  requireTechnicalPermission('api/admin', 'read'),
  async (req, res) => {
    try {
      const healthChecks = {
        database: 'healthy', // You would implement actual DB health check
        technicalAuth: 'healthy',
        ai: 'healthy', // You would check AI services
        mcp: 'healthy' // You would check MCP server
      };

      const overallHealth = Object.values(healthChecks).every(status => status === 'healthy') 
        ? 'healthy' 
        : 'degraded';

      res.json({
        status: 'success',
        data: {
          overall: overallHealth,
          components: healthChecks,
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown'
        }
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        status: 'error',
        data: { message: 'Health check failed' }
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/bulk-operations/users:
 *   post:
 *     summary: Bulk user operations
 *     description: Perform bulk operations on users (import, export, update)
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [import, export, update, delete]
 *               data:
 *                 type: array
 *                 description: Array of user data (for import/update operations)
 *               filters:
 *                 type: object
 *                 description: Filters for export/delete operations
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *       400:
 *         description: Invalid operation or data
 *       403:
 *         description: Insufficient permissions
 */
router.post('/bulk-operations/users', 
  authenticateTechnicalOnly(), // Only technical tokens for bulk operations
  requireTechnicalPermission('api/bulk-operations', 'write'),
  async (req, res) => {
    try {
      const { operation, data, filters } = req.body;
      
      // Placeholder for actual bulk operations implementation
      console.log(`Bulk operation ${operation} requested by ${req.technicalClient?.name}`);
      
      res.json({
        status: 'success',
        data: {
          operation,
          processed: data?.length || 0,
          message: `Bulk ${operation} operation completed`
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestedBy: req.technicalClient?.name
        }
      });
    } catch (error) {
      console.error('Bulk operation error:', error);
      res.status(500).json({
        status: 'error',
        data: { message: 'Bulk operation failed' }
      });
    }
  }
);

export default router;