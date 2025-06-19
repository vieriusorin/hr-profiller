import { injectable, inject } from 'inversify';
import { eq } from 'drizzle-orm';
import { TYPES, DatabaseType } from '../../../shared/types';
import { Opportunity } from '../../../domain/opportunity/entities/opportunity.entity';
import { OpportunityRepository } from '../../../domain/opportunity/repositories/opportunity.repository';
import { CreateOpportunityData } from '../../../shared/types/schema.types';
import { opportunities } from '../../../../db/schema/opportunities.schema';

@injectable()
export class DrizzleOpportunityRepository implements OpportunityRepository {
  constructor(
    @inject(TYPES.Database) 
    private readonly db: DatabaseType
  ) {}

  async findAll(): Promise<Opportunity[]> {
    const result = await this.db.select().from(opportunities);
    return result.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Opportunity | null> {
    const [result] = await this.db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id));

    return result ? this.mapToEntity(result) : null;
  }

  async create(data: CreateOpportunityData): Promise<Opportunity> {
    const [inserted] = await this.db
      .insert(opportunities)
      .values({
        opportunityName: data.opportunityName,
        clientId: data.clientId || null,
        clientName: data.clientName || null,
        expectedStartDate: data.expectedStartDate || null,
        expectedEndDate: data.expectedEndDate || null,
        probability: data.probability || null,
        status: (data.status as any) || 'In Progress',
        comment: data.comment || null,
        isActive: data.isActive ?? false,
        activatedAt: data.activatedAt || null,
      })
      .returning();

    return this.mapToEntity(inserted);
  }

  async update(id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity> {
    const updateData: any = {};
    
    if (data.opportunityName !== undefined) updateData.opportunityName = data.opportunityName;
    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.clientName !== undefined) updateData.clientName = data.clientName;
    if (data.expectedStartDate !== undefined) {
      updateData.expectedStartDate = data.expectedStartDate;
    }
    if (data.expectedEndDate !== undefined) {
      updateData.expectedEndDate = data.expectedEndDate;
    }
    if (data.probability !== undefined) updateData.probability = data.probability;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.activatedAt !== undefined) updateData.activatedAt = data.activatedAt;

    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    const [updated] = await this.db
      .update(opportunities)
      .set(updateData)
      .where(eq(opportunities.id, id))
      .returning();

    if (!updated) {
      throw new Error(`Opportunity with id ${id} not found`);
    }

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(opportunities)
      .where(eq(opportunities.id, id))
      .returning({ id: opportunities.id });

    if (result.length === 0) {
      throw new Error(`Opportunity with id ${id} not found`);
    }
  }

  private mapToEntity(data: any): Opportunity {
    return new Opportunity({
      id: data.id,
      opportunityName: data.opportunityName,
      clientId: data.clientId,
      clientName: data.clientName,
      expectedStartDate: data.expectedStartDate,
      expectedEndDate: data.expectedEndDate,
      probability: data.probability,
      status: data.status,
      comment: data.comment,
      isActive: data.isActive,
      activatedAt: data.activatedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
} 