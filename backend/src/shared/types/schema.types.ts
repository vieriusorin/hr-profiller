// ===================================================================
// SCHEMA-DERIVED TYPES
// Single source of truth for all database-related types
// When schema changes, TypeScript will catch all needed updates
// ===================================================================

// Opportunities
export { 
  TypeOpportunity, 
  TypeNewOpportunity, 
  selectOpportunitySchema,
  insertOpportunitySchema 
} from '../../../db/schema/opportunities.schema';

// People (for future use)
export { 
  TypePerson, 
  TypeNewPerson 
} from '../../../db/schema/people.schema';

// Clients (for future use) 
export {
  TypeClient,
  TypeNewClient
} from '../../../db/schema/clients.schema';

// Import the types for re-export
import type { TypeNewOpportunity, TypeOpportunity } from '../../../db/schema/opportunities.schema';

// Re-export common types for convenience
export type CreateOpportunityData = TypeNewOpportunity;
export type OpportunityData = TypeOpportunity; 