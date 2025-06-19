import { injectable, inject } from 'inversify';
import { eq } from 'drizzle-orm';
import { opportunityRoles } from '../../../../db/schema/opportunity-roles.schema';
import { Role } from '../../../domain/opportunity/entities/role.entity';
import { RoleRepository } from '../../../domain/opportunity/repositories/role.repository';
import { TypeNewOpportunityRole } from '../../../../db/schema/opportunity-roles.schema';
import { TYPES, DatabaseType } from '../../../shared/types';

@injectable()
export class DrizzleRoleRepository implements RoleRepository {
  constructor(
    @inject(TYPES.Database)
    private readonly db: DatabaseType
  ) { }

  async findAllByOpportunity(opportunityId: string): Promise<Role[]> {
    const result = await this.db
      .select()
      .from(opportunityRoles)
      .where(eq(opportunityRoles.opportunityId, opportunityId));
    return result.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Role | null> {
    const [result] = await this.db
      .select()
      .from(opportunityRoles)
      .where(eq(opportunityRoles.id, id));
    return result ? this.mapToEntity(result) : null;
  }

  async create(data: TypeNewOpportunityRole): Promise<Role> {
    const [inserted] = await this.db
      .insert(opportunityRoles)
      .values(data)
      .returning();
    return this.mapToEntity(inserted);
  }

  async update(id: string, data: Partial<TypeNewOpportunityRole>): Promise<Role> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const [updated] = await this.db
      .update(opportunityRoles)
      .set(updateData)
      .where(eq(opportunityRoles.id, id))
      .returning();
    if (!updated) {
      throw new Error(`Role with id ${id} not found`);
    }
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .delete(opportunityRoles)
      .where(eq(opportunityRoles.id, id))
      .returning({ id: opportunityRoles.id });
    if (result.length === 0) {
      throw new Error(`Role with id ${id} not found`);
    }
  }

  private mapToEntity(data: any): Role {
    return new Role(data);
  }
} 