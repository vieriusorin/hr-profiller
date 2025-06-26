import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../../infrastructure/swagger/swagger.config';
import { protectPageWithSession } from './middlewares/protectPage.middleware';
import { authorize } from './middlewares/authorization.middleware';
import { container } from '../../infrastructure/container';
import { TYPES } from '../../shared/types';
import { McpToolsController } from '../../infrastructure/http/controllers/mcp-tools.controller';
import { HealthController } from '../../infrastructure/http/controllers/health.controller';

const createServer = () => {
  const app = express();

  // Setup Express middleware
  setupExpressMiddleware(app);

  // Get controllers from DI container
  const mcpToolsController = container.get<McpToolsController>(TYPES.McpToolsController);
  const healthController = container.get<HealthController>(TYPES.HealthController);

    app.use(
      '/api-docs',
      protectPageWithSession,
      authorize(['admin']),
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec)
    );

  // Setup routes
  setupRoutes(app, mcpToolsController, healthController);

  return app;
};

function setupExpressMiddleware(app: express.Application): void {
  // CORS configuration to allow frontend access
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl requests, or Postman)
        if (!origin) return callback(null, true);

        // In development, be more permissive
        if (process.env.NODE_ENV === 'development') {
          // Allow localhost and 127.0.0.1 with any port
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
          }
        }

        // Check against allowed origins
        if (allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }

        // Allow the server's own origin for Swagger UI
        if (origin.includes(`http://localhost:${process.env.PORT || 3002}`)) {
          return callback(null, true);
        }

        console.log(`CORS: Rejecting origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
    })
  );

  // Parse JSON and cookies
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
}

function setupRoutes(
  app: express.Application, 
  mcpToolsController: McpToolsController,
  healthController: HealthController
): void {
  // Health check routes
  app.get('/health', healthController.getHealth.bind(healthController));
  app.get('/system/status', healthController.getSystemStatus.bind(healthController));

  // MCP Tools routes
  app.get('/tools', mcpToolsController.getTools.bind(mcpToolsController));
  
  // Analysis routes
  app.post('/tools/analyze-data', mcpToolsController.analyzeData.bind(mcpToolsController));
  app.post('/analyze', mcpToolsController.analyzeData.bind(mcpToolsController)); // Alternative endpoint
  
  // Compensation analysis route
  app.post('/tools/compensation-analysis', mcpToolsController.compensationAnalysis.bind(mcpToolsController));
  
  // Confidence routes
  app.post('/confidence', mcpToolsController.getConfidence.bind(mcpToolsController));
  
  // Legacy tool execution route (for backward compatibility)
  app.post('/tools/:toolName', mcpToolsController.executeTool.bind(mcpToolsController));

  // Error handling middleware
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      status: 'error',
      data: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });

  // 404 handler
  app.use('*', (req: express.Request, res: express.Response) => {
    res.status(404).json({
      status: 'error',
      data: {
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        code: 'ROUTE_NOT_FOUND'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  });
}

export default createServer; 