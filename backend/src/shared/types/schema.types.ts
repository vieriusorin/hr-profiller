export { 
  TypeOpportunity, 
  TypeNewOpportunity, 
  selectOpportunitySchema,
  CreateOpportunitySchema,
  UpdateOpportunitySchema
} from '../../../db/schema/opportunities.schema';

export { 
  TypePerson, 
  TypeNewPerson 
} from '../../../db/schema/people.schema';

export {
  TypeClient,
  TypeNewClient
} from '../../../db/schema/clients.schema';

// Import the types for re-export
import type { TypeNewOpportunity, TypeOpportunity } from '../../../db/schema/opportunities.schema';

// Re-export common types for convenience
export type CreateOpportunityData = TypeNewOpportunity;
export type OpportunityData = TypeOpportunity; 