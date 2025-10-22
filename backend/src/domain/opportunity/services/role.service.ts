import { injectable, inject } from 'inversify';
import { Role } from '../entities/role.entity';
import { RoleRepository } from '../repositories/role.repository';
import { TypeNewOpportunityRole } from '../../../../db/schema/opportunity-roles.schema';
import { TYPES } from '../../../shared/types';

/**
 * @class RoleService
 * @description Service for managing roles within opportunities.
 * Provides methods to create, retrieve, update, and delete roles,
 * as well as managing assigned members to roles.
 * @method findAllByOpportunity - Retrieve all roles for a specific opportunity.
 * @method findById - Retrieve a specific role by ID.
 * @method create - Create a new role.
 * @method update - Update an existing role.
 * @method delete - Delete a role by ID.
 * @method assignMember - Assign a member to a role.
 * @method unassignMember - Unassign a member from a role.
 * @method updateAssignedMembers - Update the list of assigned members for a role.
 * @private roleRepository - Repository for role data access.
 */
@injectable()
export class RoleService {
  constructor(
    @inject(TYPES.RoleRepository)
    private readonly roleRepository: RoleRepository
  ) { }

  async findAllByOpportunity(opportunityId: string): Promise<Role[]> {
    return this.roleRepository.findAllByOpportunity(opportunityId);
  }

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findById(id);
  }

  async create(data: TypeNewOpportunityRole): Promise<Role> {
    return this.roleRepository.create(data);
  }

  async update(id: string, data: Partial<TypeNewOpportunityRole>): Promise<Role> {
    return this.roleRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.roleRepository.delete(id);
  }

  // New methods for managing assigned members
  async assignMember(roleId: string, personId: string): Promise<void> {
    return this.roleRepository.assignMember(roleId, personId);
  }

  async unassignMember(roleId: string, personId: string): Promise<void> {
    return this.roleRepository.unassignMember(roleId, personId);
  }

  async updateAssignedMembers(roleId: string, personIds: string[]): Promise<void> {
    return this.roleRepository.updateAssignedMembers(roleId, personIds);
  }
} 