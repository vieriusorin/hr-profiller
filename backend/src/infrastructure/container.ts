import { Container } from 'inversify';
import db from '../../db';
import { TYPES, DatabaseType } from '../shared/types';
import { OpportunityService } from '../domain/opportunity/services/opportunity.service';
import { DrizzleOpportunityRepository } from './database/repositories/drizzle-opportunity.repository';
import { OpportunityController } from './http/controllers/opportunity.controller';
import { OpportunityRepository } from '../domain/opportunity/repositories/opportunity.repository';
import { DrizzleRoleRepository } from './database/repositories/drizzle-role.repository';
import { RoleService } from '../domain/opportunity/services/role.service';
import { RoleRepository } from '../domain/opportunity/repositories/role.repository';
import { RoleController } from './http/controllers/role.controller';
import { EmployeeController } from './http/controllers/employee.controller';
import { LookupController } from './http/controllers/lookup.controller';
// New DDD imports
import { PersonRepository } from '../domain/person/repositories/person.repository';
import { DrizzlePersonRepository } from './database/repositories/drizzle-person.repository';
import { PersonService } from '../domain/person/services/person.service';
import { EmploymentRepository } from '../domain/employee/repositories/employment.repository';
import { DrizzleEmploymentRepository } from './database/repositories/drizzle-employment.repository';
import { EmploymentService } from '../domain/employee/services/employment.service';
import { EmployeeApplicationService } from '../domain/employee/services/employee-application.service';
import { PersonController } from './http/controllers/person.controller';
// MCP imports
import { McpClientService } from '../domain/mcp/services/mcp-client.service';
import { McpController } from './http/controllers/mcp.controller';
// AI imports
import { OpenAIService } from '../domain/ai/services/openai.service';
import { VectorDatabaseService } from '../domain/ai/services/vector-database.service';
import { RAGService } from '../domain/ai/services/rag.service';
import { AIController } from './http/controllers/ai.controller';
import { AuthController } from './http/controllers/auth.controller';

const container = new Container();

// Infrastructure bindings - Using centralized type
container.bind<DatabaseType>(TYPES.Database).toConstantValue(db);

// Repository bindings
container.bind<OpportunityRepository>(TYPES.OpportunityRepository).to(DrizzleOpportunityRepository);
container.bind<RoleRepository>(TYPES.RoleRepository).to(DrizzleRoleRepository);
// New DDD repository bindings
container.bind<PersonRepository>(TYPES.PersonRepository).to(DrizzlePersonRepository);
container.bind<EmploymentRepository>(TYPES.EmploymentRepository).to(DrizzleEmploymentRepository);

// Service bindings 
container.bind<OpportunityService>(TYPES.OpportunityService).to(OpportunityService);
container.bind<RoleService>(TYPES.RoleService).to(RoleService);
// New DDD service bindings
container.bind<PersonService>(TYPES.PersonService).to(PersonService);
container.bind<EmploymentService>(TYPES.EmploymentService).to(EmploymentService);
container.bind<EmployeeApplicationService>(TYPES.EmployeeApplicationService).to(EmployeeApplicationService);
// MCP service bindings
container.bind<McpClientService>(TYPES.McpClientService).to(McpClientService);
// AI service bindings
container.bind<OpenAIService>(TYPES.OpenAIService).to(OpenAIService);
container.bind<VectorDatabaseService>(TYPES.VectorDatabaseService).to(VectorDatabaseService);
container.bind<RAGService>(TYPES.RAGService).to(RAGService);

// Controller bindings
container.bind<OpportunityController>(TYPES.OpportunityController).to(OpportunityController);
container.bind<RoleController>(TYPES.RoleController).to(RoleController);
container.bind<EmployeeController>(TYPES.EmployeeController).to(EmployeeController);
container.bind<PersonController>(TYPES.PersonController).to(PersonController);
container.bind<LookupController>(TYPES.LookupController).to(LookupController);
// MCP controller bindings
container.bind<McpController>(TYPES.McpController).to(McpController);
// AI controller bindings
container.bind<AIController>(TYPES.AIController).to(AIController);
// Auth controller binding
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

export { container };
