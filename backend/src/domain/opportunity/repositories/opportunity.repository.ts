import { Opportunity } from '../entities/opportunity.entity';
import { CreateOpportunityData } from '../../../shared/types/schema.types';

export interface OpportunityRepository {
  findAll(): Promise<Opportunity[]>;
  findById(id: string): Promise<Opportunity | null>;
  create(data: CreateOpportunityData): Promise<Opportunity>;
  update(id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity>;
  delete(id: string): Promise<void>;
} 