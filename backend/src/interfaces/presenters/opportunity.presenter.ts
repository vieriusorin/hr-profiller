import { Opportunity } from '../../domain/opportunity/entities/opportunity.entity';
import { OpportunityPresentation } from '../../shared/types/presentation.types';
import { EnhancedBasePresenter } from './enhanced-base.presenter';
import {
  OpportunityFilterBuilder,
  OpportunitySearchBuilder,
  OpportunitySortBuilder
} from './builders/opportunity-builders';

export class OpportunityPresenter extends EnhancedBasePresenter<Opportunity, OpportunityPresentation> {

  constructor() {
    super();
    this.setFilterBuilder(new OpportunityFilterBuilder())
      .setSearchBuilder(new OpportunitySearchBuilder())
      .setSortBuilder(new OpportunitySortBuilder());
  }

  present(opportunity: Opportunity): OpportunityPresentation {
    const result = {
      ...opportunity,
      expectedStartDate: opportunity.expectedStartDate ? opportunity.expectedStartDate.toISOString() : null,
      expectedEndDate: opportunity.expectedEndDate ? opportunity.expectedEndDate.toISOString() : null,
      activatedAt: opportunity.activatedAt ? opportunity.activatedAt.toISOString() : null,
      createdAt: opportunity.createdAt.toISOString(),
      updatedAt: opportunity.updatedAt.toISOString(),
      roles: (opportunity as any).roles || [],
      isHighProbability: opportunity.isHighProbability(),
      duration: opportunity.getDuration(),
      isExpiringSoon: opportunity.isExpiringSoon(),
    };

    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt), 
      activatedAt: result.activatedAt ? new Date(result.activatedAt) : null,
      expectedStartDate: result.expectedStartDate,
      expectedEndDate: result.expectedEndDate
    };
  }
}