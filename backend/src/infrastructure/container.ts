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
import { EmployeeRepository } from '../domain/employee/repositories/employee.repository';
import { DrizzleEmployeeRepository } from './database/repositories/drizzle-employee.repository';
import { EmployeeService } from '../domain/employee/services/employee.service';
import { EmployeeController } from './http/controllers/employee.controller';

const container = new Container();

// Infrastructure bindings - Using centralized type
container.bind<DatabaseType>(TYPES.Database).toConstantValue(db);

// Repository bindings
container.bind<OpportunityRepository>(TYPES.OpportunityRepository).to(DrizzleOpportunityRepository);
container.bind<RoleRepository>(TYPES.RoleRepository).to(DrizzleRoleRepository);
container.bind<EmployeeRepository>(TYPES.EmployeeRepository).to(DrizzleEmployeeRepository);

// Service bindings 
container.bind<OpportunityService>(TYPES.OpportunityService).to(OpportunityService);
container.bind<RoleService>(RoleService).toSelf();
container.bind<EmployeeService>(TYPES.EmployeeService).to(EmployeeService);

// Controller bindings
container.bind<OpportunityController>(TYPES.OpportunityController).to(OpportunityController);
container.bind<RoleController>(TYPES.RoleController).to(RoleController);
container.bind<EmployeeController>(TYPES.EmployeeController).to(EmployeeController);

export { container };
