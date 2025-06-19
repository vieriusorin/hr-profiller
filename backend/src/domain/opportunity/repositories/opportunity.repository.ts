import { Opportunity } from '../entities/opportunity.entity';

export interface CreateOpportunityData {
  opportunityName: string;
  clientId?: string;
  clientName?: string;
  expectedStartDate?: Date;
  expectedEndDate?: Date;
  probability?: number;
  status?: string;
  comment?: string;
  isActive?: boolean;
  activatedAt?: Date | null;
}

export interface OpportunityRepository {
  findAll(): Promise<Opportunity[]>;
  findById(id: string): Promise<Opportunity | null>;
  create(data: CreateOpportunityData): Promise<Opportunity>;
  update(id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity>;
  delete(id: string): Promise<void>;
} 