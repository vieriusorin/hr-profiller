import { DrizzleOpportunityRepository } from './database/repositories/drizzle-opportunity.repository';
import { OpportunityService } from '../domain/opportunity/services/opportunity.service';
import { OpportunityController } from './http/controllers/opportunity.controller';

import db from './database/index';

export const container = {
  db: db as any,
  opportunityRepository: new DrizzleOpportunityRepository(db as any),
  resolve: function (target: typeof OpportunityController) {
    if (target === OpportunityController) {
      const opportunityService = new OpportunityService(this.opportunityRepository);
      return new OpportunityController(opportunityService);
    }

    throw new Error(`Cannot resolve dependency for ${target.name}`);
  },
};
