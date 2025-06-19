import { Container } from 'inversify';
import db from '../../db';
import { TYPES, DatabaseType } from '../shared/types';
import { OpportunityService } from '../domain/opportunity/services/opportunity.service';
import { DrizzleOpportunityRepository } from './database/repositories/drizzle-opportunity.repository';
import { OpportunityController } from './http/controllers/opportunity.controller';
import { OpportunityRepository } from '../domain/opportunity/repositories/opportunity.repository';

const container = new Container();

// Infrastructure bindings - Using centralized type
container.bind<DatabaseType>(TYPES.Database).toConstantValue(db);

// Repository bindings
container.bind<OpportunityRepository>(TYPES.OpportunityRepository).to(DrizzleOpportunityRepository);

// Service bindings 
container.bind<OpportunityService>(TYPES.OpportunityService).to(OpportunityService);

// Controller bindings
container.bind<OpportunityController>(TYPES.OpportunityController).to(OpportunityController);

export { container };
