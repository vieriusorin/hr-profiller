import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '../shared/types';

// Domain Services
import { McpAnalysisService, OpenAIService, McpPromptEngineService } from '../domain/analysis/services/analysis.service';

// Infrastructure Services
import { OpenAIServiceImpl } from './services/openai.service';
import { PromptEngineServiceImpl } from './services/prompt-engine.service';

// Controllers
import { McpToolsController } from './http/controllers/mcp-tools.controller';
import { HealthController } from './http/controllers/health.controller';

// Middleware
import { protectPageWithSession } from '../interfaces/http/middlewares/protectPage.middleware';
import { authorize } from '../interfaces/http/middlewares/authorization.middleware';

const container = new Container();

// Infrastructure service bindings
container.bind<OpenAIService>(TYPES.OpenAIService).to(OpenAIServiceImpl);
container.bind<McpPromptEngineService>(TYPES.McpPromptEngineService).to(PromptEngineServiceImpl);

// Domain service bindings
container.bind<McpAnalysisService>(TYPES.McpAnalysisService).to(McpAnalysisService);

// Controller bindings
container.bind<McpToolsController>(TYPES.McpToolsController).to(McpToolsController);
container.bind<HealthController>(TYPES.HealthController).to(HealthController);

// Middleware bindings (for dependency injection if needed)
container.bind<Function>(TYPES.AuthenticationMiddleware).toFunction(protectPageWithSession);
container.bind<Function>(TYPES.AuthorizationMiddleware).toFunction(authorize);

export { container }; 