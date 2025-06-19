import { 
  OpportunityRepository, 
  CreateOpportunityData 
} from '../repositories/opportunity.repository';
import { Opportunity } from '../entities/opportunity.entity';

export class OpportunityService {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async getAllOpportunities(): Promise<Opportunity[]> {
    return this.opportunityRepository.findAll();
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    return this.opportunityRepository.findById(id);
  }

  async createOpportunity(data: CreateOpportunityData): Promise<Opportunity> {
    // Apply business logic here if needed
    // For example, auto-activate if probability >= 80%
    const processedData = {
      ...data,
      isActive: data.isActive ?? (data.probability ? data.probability >= 80 : false),
      activatedAt: data.isActive ?? (data.probability ? data.probability >= 80 : false) ? new Date() : null,
    };

    return this.opportunityRepository.create(processedData);
  }

  async updateOpportunity(id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity> {
    // Get current opportunity to apply business logic
    const current = await this.opportunityRepository.findById(id);
    if (!current) {
      throw new Error(`Opportunity with id ${id} not found`);
    }

    // Apply business logic for auto-activation
    const processedData = { ...data };
    
    if (data.probability !== undefined) {
      if (data.probability >= 80 && !current.isActive) {
        // Auto-activate if probability increased to >= 80%
        processedData.isActive = true;
        processedData.activatedAt = new Date();
      } else if (data.probability < 80 && current.isActive && current.activatedAt) {
        // Only auto-deactivate if it was auto-activated
        const wasAutoActivated = current.activatedAt.getTime() === current.createdAt.getTime();
        if (wasAutoActivated) {
          processedData.isActive = false;
          processedData.activatedAt = null;
        }
      }
    }

    return this.opportunityRepository.update(id, processedData);
  }

  async deleteOpportunity(id: string): Promise<void> {
    return this.opportunityRepository.delete(id);
  }
} 