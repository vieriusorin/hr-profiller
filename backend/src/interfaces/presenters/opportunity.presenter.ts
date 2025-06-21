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

    // Set up the builders for filtering, searching, and sorting
    this.setFilterBuilder(new OpportunityFilterBuilder())
      .setSearchBuilder(new OpportunitySearchBuilder())
      .setSortBuilder(new OpportunitySortBuilder());
  }

  present(opportunity: Opportunity): OpportunityPresentation {
    const formattedOpportunity = {
      ...opportunity,
      expectedStartDate: opportunity.expectedStartDate ? new Date(opportunity.expectedStartDate) : null,
      expectedEndDate: opportunity.expectedEndDate ? new Date(opportunity.expectedEndDate) : null,
    };

    return {
      ...formattedOpportunity,
      roles: (opportunity as any).roles || [], // Use the roles fetched by OpportunityService
      // Add computed fields from business logic
      isHighProbability: opportunity.isHighProbability(),
      duration: opportunity.getDuration(),
      isExpiringSoon: opportunity.isExpiringSoon(),
    };
  }
} 