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

  /**
   * Transform a single opportunity
   * Uses schema as base + adds computed fields from business logic
   */
  present(opportunity: Opportunity, options?: any): OpportunityPresentation {
    return {
      ...opportunity,
      // Add computed fields from business logic
      isHighProbability: opportunity.isHighProbability(),
      duration: opportunity.getDuration(),
      isExpiringSoon: opportunity.isExpiringSoon(),
    };
  }
} 