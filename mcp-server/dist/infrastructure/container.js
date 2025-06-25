"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const types_1 = require("../shared/types");
// Domain Services
const mcp_analysis_service_1 = require("../domain/services/mcp-analysis.service");
// Infrastructure Services
const openai_service_1 = require("./services/openai.service");
const prompt_engine_service_1 = require("./services/prompt-engine.service");
// Controllers
const mcp_tools_controller_1 = require("./http/controllers/mcp-tools.controller");
const health_controller_1 = require("./http/controllers/health.controller");
// Middleware
const protectPage_middleware_1 = require("../interfaces/http/middlewares/protectPage.middleware");
const authorization_middleware_1 = require("../interfaces/http/middlewares/authorization.middleware");
const container = new inversify_1.Container();
exports.container = container;
// Infrastructure service bindings
container.bind(types_1.TYPES.OpenAIService).to(openai_service_1.OpenAIServiceImpl);
container.bind(types_1.TYPES.McpPromptEngineService).to(prompt_engine_service_1.PromptEngineServiceImpl);
// Domain service bindings
container.bind(types_1.TYPES.McpAnalysisService).to(mcp_analysis_service_1.McpAnalysisService);
// Controller bindings
container.bind(types_1.TYPES.McpToolsController).to(mcp_tools_controller_1.McpToolsController);
container.bind(types_1.TYPES.HealthController).to(health_controller_1.HealthController);
// Middleware bindings (for dependency injection if needed)
container.bind(types_1.TYPES.AuthenticationMiddleware).toFunction(protectPage_middleware_1.protectPageWithSession);
container.bind(types_1.TYPES.AuthorizationMiddleware).toFunction(authorization_middleware_1.authorize);
