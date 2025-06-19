import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Opportunity, OpportunityStatus } from '../../../domain/opportunity/entities/opportunity.entity';
import { 
  OpportunityRepository, 
  CreateOpportunityData 
} from '../../../domain/opportunity/repositories/opportunity.repository';
import { opportunities } from '../../../../db/schema/opportunities.schema';
import * as schema from '../../../../db/schema';

export class DrizzleOpportunityRepository implements OpportunityRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

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
    // The database will auto-generate the UUID using DEFAULT gen_random_uuid()
    const [inserted] = await this.db
      .insert(opportunities)
      .values({
        opportunityName: data.opportunityName,
        clientId: data.clientId || null,
        clientName: data.clientName || null,
        expectedStartDate: data.expectedStartDate ? data.expectedStartDate.toISOString().split('T')[0] : null,
        expectedEndDate: data.expectedEndDate ? data.expectedEndDate.toISOString().split('T')[0] : null,
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
      updateData.expectedStartDate = data.expectedStartDate ? data.expectedStartDate.toISOString().split('T')[0] : null;
    }
    if (data.expectedEndDate !== undefined) {
      updateData.expectedEndDate = data.expectedEndDate ? data.expectedEndDate.toISOString().split('T')[0] : null;
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
    return new Opportunity(
      data.id,
      data.opportunityName,
      data.clientId,
      data.clientName,
      data.expectedStartDate ? new Date(data.expectedStartDate) : null,
      data.expectedEndDate ? new Date(data.expectedEndDate) : null,
      data.probability,
      data.status as OpportunityStatus,
      data.comment,
      data.isActive,
      data.activatedAt ? new Date(data.activatedAt) : null,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }
} 