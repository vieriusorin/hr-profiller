import { Role } from '../entities/role.entity';
import { TypeNewOpportunityRole } from '../../../../db/schema/opportunity-roles.schema';

/**
 * @description Repository interface for Role entity.
 * Defines methods for CRUD operations and managing assigned members.
 * @interface RoleRepository
 * @method findAllByOpportunity - Retrieve all role records for a specific opportunity.
 * @method findById - Retrieve a role record by its ID.
 * @method create - Create a new role record.
 * @method update - Update an existing role record.
 * @method delete - Delete a role record by its ID.
 * @method assignMember - Assign a member to a role.
 * @method unassignMember - Unassign a member from a role.
 * @method updateAssignedMembers - Update the list of assigned members for a role.
 */
export interface RoleRepository {
  findAllByOpportunity(opportunityId: string): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  create(data: TypeNewOpportunityRole): Promise<Role>;
  update(id: string, data: Partial<TypeNewOpportunityRole>): Promise<Role>;
  delete(id: string): Promise<void>;

  // New methods for managing assigned members
  assignMember(roleId: string, personId: string): Promise<void>;
  unassignMember(roleId: string, personId: string): Promise<void>;
  updateAssignedMembers(roleId: string, personIds: string[]): Promise<void>;
} 