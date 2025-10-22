import { Opportunity } from '../entities/opportunity.entity';
import { CreateOpportunityData } from '../../../shared/types/schema.types';

/**
 * @description Repository interface for Opportunity entity.
 * Defines methods for CRUD operations and specific queries.
 * @interface OpportunityRepository
 * @method findAll - Retrieve all opportunity records.
 * @method findById - Retrieve an opportunity record by its ID.
 * @method create - Create a new opportunity record.
 * @method update - Update an existing opportunity record.
 * @method delete - Delete an opportunity record by its ID.
 */
export interface OpportunityRepository {
  findAll(): Promise<Opportunity[]>;
  findById(id: string): Promise<Opportunity | null>;
  create(data: CreateOpportunityData): Promise<Opportunity>;
  update(id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity>;
  delete(id: string): Promise<void>;
} 