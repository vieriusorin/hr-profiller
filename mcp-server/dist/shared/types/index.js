"use strict";
// Shared types and dependency injection symbols for MCP Server
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPES = void 0;
// Dependency Injection Types
const TYPES = {
    // External Services
    OpenAIService: Symbol.for('OpenAIService'),
    // Domain Services
    McpAnalysisService: Symbol.for('McpAnalysisService'),
    McpReportService: Symbol.for('McpReportService'),
    McpBenchmarkingService: Symbol.for('McpBenchmarkingService'),
    McpPromptEngineService: Symbol.for('McpPromptEngineService'),
    // Infrastructure Services
    McpServerService: Symbol.for('McpServerService'),
    // Controllers
    McpToolsController: Symbol.for('McpToolsController'),
    HealthController: Symbol.for('HealthController'),
    // Repositories (if needed for future data persistence)
    AnalysisRepository: Symbol.for('AnalysisRepository'),
    // Middleware
    AuthenticationMiddleware: Symbol.for('AuthenticationMiddleware'),
    AuthorizationMiddleware: Symbol.for('AuthorizationMiddleware'),
};
exports.TYPES = TYPES;
