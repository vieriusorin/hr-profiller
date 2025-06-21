import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import {
  OpportunityRepository
} from '../repositories/opportunity.repository';
import { RoleService } from './role.service';
import { CreateOpportunityData } from '../../../shared/types/schema.types';
import { Opportunity } from '../entities/opportunity.entity';

@injectable()
export class OpportunityService {
  constructor(
    @inject(TYPES.OpportunityRepository)
    private readonly opportunityRepository: OpportunityRepository,
    @inject(TYPES.RoleService)
    private readonly roleService: RoleService
  ) { }

  async getAllOpportunities(): Promise<Opportunity[]> {
    const opportunities = await this.opportunityRepository.findAll();

    // Fetch roles for each opportunity and attach them
    const opportunitiesWithRoles = await Promise.all(
      opportunities.map(async (opportunity) => {
        const roles = await this.roleService.findAllByOpportunity(opportunity.id);
        (opportunity as any).roles = roles;
        return opportunity;
      })
    );

    return opportunitiesWithRoles;
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    const opportunity = await this.opportunityRepository.findById(id);
    if (!opportunity) {
      return null;
    }

    // Fetch associated roles and attach them to the opportunity
    const roles = await this.roleService.findAllByOpportunity(id);
    (opportunity as any).roles = roles;

    return opportunity;
  }

  async createOpportunity(data: CreateOpportunityData): Promise<Opportunity> {
    // Apply business logic here if needed
    // For example, auto-activate if probability >= 80%
    const processedData = {
      ...data,
      isActive: data.isActive ?? (data.probability != null ? data.probability >= 80 : false),
      activatedAt: data.isActive ?? (data.probability != null ? data.probability >= 80 : false) ? new Date() : undefined,
    };

    return this.opportunityRepository.create(processedData);
  }

  async updateOpportunity(id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity> {
    const current = await this.opportunityRepository.findById(id);
    if (!current) {
      throw new Error(`Opportunity with id ${id} not found`);
    }

    // Apply business logic for auto-activation
    const processedData = { ...data };

    if (data.probability !== undefined && data.probability !== null) {
      if (data.probability >= 80 && !current.isActive) {
        // Auto-activate if probability increased to >= 80%
        processedData.isActive = true;
        processedData.activatedAt = new Date();
      } else if (data.probability < 80 && current.isActive && current.activatedAt) {
        // Only auto-deactivate if it was auto-activated
        const wasAutoActivated = current.activatedAt.getTime() === current.createdAt.getTime();
        if (wasAutoActivated) {
          processedData.isActive = false;
          processedData.activatedAt = undefined;
        }
      }
    }

    return this.opportunityRepository.update(id, processedData);
  }

  async deleteOpportunity(id: string): Promise<void> {
    return this.opportunityRepository.delete(id);
  }
} 