// ================================================================
// PRESENTATION TYPES - Single Source of Truth
// Extends schema types with computed fields from business logic
// ================================================================

import { TypeOpportunity } from './schema.types';

/**
 * Opportunity presentation type
 * Base: TypeOpportunity (from schema)
 * + Computed fields from business logic
 */
export interface OpportunityPresentation extends TypeOpportunity {
  // Computed fields (not stored in database)
  isHighProbability: boolean;   // >= 80% probability
  duration: number | null;      // Project duration in days
  isExpiringSoon: boolean;      // Expiring within 30 days
}

// Add more presentation types here as you expand:
// export interface PersonPresentation extends TypePerson { ... }
// export interface ClientPresentation extends TypeClient { ... } 