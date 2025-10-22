import { injectable, inject } from 'inversify';
import { eq, and, sql } from 'drizzle-orm';
import { opportunityRoles } from '../../../../db/schema/opportunity-roles.schema';
import { opportunityRoleAssignments } from '../../../../db/schema/opportunity-role-assignments.schema';
import { Role, AssignedMember } from '../../../domain/opportunity/entities/role.entity';
import { RoleRepository } from '../../../domain/opportunity/repositories/role.repository';
import { TypeNewOpportunityRole } from '../../../../db/schema/opportunity-roles.schema';
import { TYPES, DatabaseType } from '../../../shared/types';

/**
 * @class DrizzleRoleRepository
 * @description Implementation of RoleRepository using Drizzle ORM.
 * Provides methods for CRUD operations on Role entity and managing assigned members.
 * @implements RoleRepository
 * @method findAllByOpportunity - Retrieve all roles for a specific opportunity.
 * @method findById - Retrieve a role record by its ID.
 * @method create - Create a new role record.
 * @method update - Update an existing role record.
 * @method delete - Delete a role record by its ID.
 * @method assignMember - Assign a member to a role.
 * @method unassignMember - Unassign a member from a role.
 * @method updateAssignedMembers - Update the list of assigned members for a role.
 * @private db - Drizzle ORM database instance.
 * @returns Role entities with assigned members where applicable.
 */
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

    // For each role, fetch assigned members
    const rolesWithMembers = await Promise.all(
      result.map(async (role) => {
        const assignedMembers = await this.getAssignedMembers(role.id);
        return this.mapToEntity(role, assignedMembers);
      })
    );

    return rolesWithMembers;
  }

  async findById(id: string): Promise<Role | null> {
    const [result] = await this.db
      .select()
      .from(opportunityRoles)
      .where(eq(opportunityRoles.id, id));

    if (!result) return null;

    const assignedMembers = await this.getAssignedMembers(id);
    return this.mapToEntity(result, assignedMembers);
  }

  async create(data: TypeNewOpportunityRole): Promise<Role> {
    const [inserted] = await this.db
      .insert(opportunityRoles)
      .values(data)
      .returning();
    return this.mapToEntity(inserted, []);
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

    const assignedMembers = await this.getAssignedMembers(id);
    return this.mapToEntity(updated, assignedMembers);
  }

  async delete(id: string): Promise<void> {
    // First delete all assignments for this role
    await this.db
      .delete(opportunityRoleAssignments)
      .where(eq(opportunityRoleAssignments.opportunityRoleId, id));

    // Then delete the role
    const result = await this.db
      .delete(opportunityRoles)
      .where(eq(opportunityRoles.id, id))
      .returning({ id: opportunityRoles.id });
    if (result.length === 0) {
      throw new Error(`Role with id ${id} not found`);
    }
  }

  async assignMember(roleId: string, personId: string): Promise<void> {
    await this.db
      .insert(opportunityRoleAssignments)
      .values({
        opportunityRoleId: roleId,
        personId: personId,
      });
  }

  async unassignMember(roleId: string, personId: string): Promise<void> {
    await this.db
      .delete(opportunityRoleAssignments)
      .where(
        and(
          eq(opportunityRoleAssignments.opportunityRoleId, roleId),
          eq(opportunityRoleAssignments.personId, personId)
        )
      );
  }

  async updateAssignedMembers(roleId: string, personIds: string[]): Promise<void> {
    // Remove all existing assignments
    await this.db
      .delete(opportunityRoleAssignments)
      .where(eq(opportunityRoleAssignments.opportunityRoleId, roleId));

    // Add new assignments
    if (personIds.length > 0) {
      const assignments = personIds.map(personId => ({
        opportunityRoleId: roleId,
        personId: personId,
      }));

      await this.db
        .insert(opportunityRoleAssignments)
        .values(assignments);
    }
  }

  private async getAssignedMembers(roleId: string): Promise<AssignedMember[]> {
    const result = await this.db.execute(sql`
      SELECT 
        people.id as "id",
        people.first_name as "firstName",
        people.last_name as "lastName",
        people.full_name as "fullName",
        people.email as "email",
        opportunity_role_assignments.created_at as "assignedAt"
      FROM opportunity_role_assignments
      INNER JOIN people ON opportunity_role_assignments.person_id = people.id
      WHERE opportunity_role_assignments.opportunity_role_id = ${roleId}
    `);

    return result.rows as unknown as AssignedMember[];
  }

  private mapToEntity(data: any, assignedMembers: AssignedMember[] = []): Role {
    return new Role({
      id: data.id,
      opportunityId: data.opportunityId,
      roleName: data.roleName,
      jobGrade: data.jobGrade,
      level: data.level,
      allocation: data.allocation,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      notes: data.notes,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      assignedMembers,
    });
  }
} 