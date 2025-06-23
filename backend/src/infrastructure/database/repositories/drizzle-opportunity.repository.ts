import { injectable, inject } from 'inversify';
import { eq, sql } from 'drizzle-orm';
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
    const result = await this.db.select().from(opportunities).orderBy(opportunities.expectedStartDate);
    console.log('🔍 [DrizzleOpportunityRepository] Total opportunities found:', result.length);
    console.log('🔍 [DrizzleOpportunityRepository] All opportunities:', JSON.stringify(result, null, 2));
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
    // Use raw SQL like the employment repository to ensure proper date handling
    const result = await this.db.execute(sql`
      INSERT INTO opportunities (
        opportunity_name, client_id, client_name, expected_start_date, expected_end_date,
        probability, status, comment, is_active, activated_at
      )
      VALUES (
        ${data.opportunityName},
        ${data.clientId || null},
        ${data.clientName || null},
        ${data.expectedStartDate || null},
        ${data.expectedEndDate || null},
        ${data.probability || null},
        ${data.status || 'In Progress'},
        ${data.comment || null},
        ${data.isActive ?? false},
        ${data.activatedAt || null}
      )
      RETURNING *
    `);

    const inserted = result.rows[0] as any;
    return this.mapToEntity(inserted);
  }

  async update(id: string, data: Partial<CreateOpportunityData>): Promise<Opportunity> {
    const updateData: any = {};
    
    if (data.opportunityName !== undefined) updateData.opportunityName = data.opportunityName;
    if (data.clientId !== undefined) updateData.clientId = data.clientId;
    if (data.clientName !== undefined) updateData.clientName = data.clientName;
    if (data.expectedStartDate !== undefined) {
      updateData.expectedStartDate = data.expectedStartDate ? new Date(data.expectedStartDate) : null;
    }
    if (data.expectedEndDate !== undefined) {
      updateData.expectedEndDate = data.expectedEndDate ? new Date(data.expectedEndDate) : null;
    }
    if (data.probability !== undefined) updateData.probability = data.probability;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.activatedAt !== undefined) {
      updateData.activatedAt = data.activatedAt ? new Date(data.activatedAt) : null;
    }

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
    console.log('🔍 [DrizzleOpportunityRepository] Raw data from DB:', JSON.stringify(data, null, 2));
    console.log('🔍 [DrizzleOpportunityRepository] Object keys:', Object.keys(data));
    
    // Check all possible field name variations
    console.log('🔍 [DrizzleOpportunityRepository] Date field analysis:');
    console.log('  data.expectedStartDate:', data.expectedStartDate);
    console.log('  data.expected_start_date:', data.expected_start_date);
    
    // Try to find the correct field names by looking at all fields that contain "start" or "end"
    Object.keys(data).forEach(key => {
      if (key.toLowerCase().includes('start') || key.toLowerCase().includes('end')) {
        console.log(`  Found date-related field: ${key} = ${data[key]}`);
      }
    });

    // Pass raw data to entity constructor and let it handle the conversion
    return new Opportunity({
      id: data.id,
      opportunityName: data.opportunityName || data.opportunity_name,
      clientId: data.clientId || data.client_id,
      clientName: data.clientName || data.client_name,
      expectedStartDate: data.expectedStartDate || data.expected_start_date,
      expectedEndDate: data.expectedEndDate || data.expected_end_date,
      probability: data.probability,
      status: data.status,
      comment: data.comment,
      isActive: data.isActive !== undefined ? data.isActive : data.is_active,
      activatedAt: data.activatedAt || data.activated_at,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    } as any);
  }
} 