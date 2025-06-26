"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_config_1 = require("../../infrastructure/swagger/swagger.config");
const protectPage_middleware_1 = require("./middlewares/protectPage.middleware");
const authorization_middleware_1 = require("./middlewares/authorization.middleware");
const container_1 = require("../../infrastructure/container");
const types_1 = require("../../shared/types");
const createServer = () => {
    const app = (0, express_1.default)();
    // Setup Express middleware
    setupExpressMiddleware(app);
    // Get controllers from DI container
    const mcpToolsController = container_1.container.get(types_1.TYPES.McpToolsController);
    const healthController = container_1.container.get(types_1.TYPES.HealthController);
    app.use('/api-docs', protectPage_middleware_1.protectPageWithSession, (0, authorization_middleware_1.authorize)(['admin']), swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerSpec));
    // Setup routes
    setupRoutes(app, mcpToolsController, healthController);
    return app;
};
function setupExpressMiddleware(app) {
    // CORS configuration to allow frontend access
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
    ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl requests, or Postman)
            if (!origin)
                return callback(null, true);
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
    }));
    // Parse JSON and cookies
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.urlencoded({ extended: true }));
}
function setupRoutes(app, mcpToolsController, healthController) {
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
    app.use((error, req, res, next) => {
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
    app.use('*', (req, res) => {
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
exports.default = createServer;
