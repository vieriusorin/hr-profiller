import { Role } from '../entities/role.entity';
import { TypeNewOpportunityRole } from '../../../../db/schema/opportunity-roles.schema';

export interface RoleRepository {
  findAllByOpportunity(opportunityId: string): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  create(data: TypeNewOpportunityRole): Promise<Role>;
  update(id: string, data: Partial<TypeNewOpportunityRole>): Promise<Role>;
  delete(id: string): Promise<void>;
} 