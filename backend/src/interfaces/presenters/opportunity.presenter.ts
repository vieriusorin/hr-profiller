import { Opportunity } from '../../domain/opportunity/entities/opportunity.entity';
import { OpportunityPresentation } from '../../shared/types/presentation.types';
import { EnhancedBasePresenter } from './enhanced-base.presenter';
import {
  OpportunityFilterBuilder,
  OpportunitySearchBuilder,
  OpportunitySortBuilder
} from './builders/opportunity-builders';

/**
 * @description Presenter for Opportunity entities.
 * Transforms Opportunity domain entities into OpportunityPresentation format.
 * Utilizes filtering, searching, and sorting builders for enhanced data handling.
 * @method present - Transforms an Opportunity into OpportunityPresentation format.
 * @constructor - Sets up the filter, search, and sort builders.
 * @uses OpportunityFilterBuilder
 * @uses OpportunitySearchBuilder
 * @uses OpportunitySortBuilder
 * @class OpportunityPresenter
 * @extends {EnhancedBasePresenter<Opportunity, OpportunityPresentation>}
 * @method present - Transforms an Opportunity into OpportunityPresentation format.
 * @param {Opportunity} opportunity - The Opportunity entity to present
 */
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