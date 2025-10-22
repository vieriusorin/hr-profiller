import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { RoleService } from '../../../domain/opportunity/services/role.service';
import { TYPES } from '../../../shared/types';
import { insertOpportunityRoleSchema } from '../../../../db/schema/opportunity-roles.schema';
import { z } from 'zod';

// Schema for assigning/unassigning members
/**
 * @schema AssignMemberSchema
 * @description Schema for assigning a member to a role.
 * @property personId - The ID of the person to be assigned.
 */
const assignMemberSchema = z.object({
  personId: z.string().uuid('Person ID must be a valid UUID')
});

/**
 * @schema UpdateAssignedMembersSchema
 * @description Schema for updating assigned members of a role.
 * @property personIds - An array of person IDs to be assigned to the role.
 */
const updateAssignedMembersSchema = z.object({
  personIds: z.array(z.string().uuid('Each person ID must be a valid UUID'))
});

/**
 * @class RoleController
 * @description Controller for role-related endpoints.
 * Handles requests for creating, retrieving, updating, and deleting roles,
 * as well as managing assigned members.
 * @method getAllByOpportunity - Retrieve all roles for a specific opportunity.
 * @method getById - Retrieve a specific role by ID.
 * @method create - Create a new role.
 * @method update - Update an existing role by ID.
 * @method delete - Delete a role by ID.
 * @method assignMember - Assign a member to a role.
 * @method unassignMember - Unassign a member from a role.
 * @method updateAssignedMembers - Update the list of assigned members for a role.
 * @private roleService - Service for role operations.
 */
@injectable()
export class RoleController {
  constructor(
    @inject(TYPES.RoleService) private readonly roleService: RoleService
  ) { }

  async getAllByOpportunity(req: Request, res: Response) {
    const { opportunityId } = req.params;
    const roles = await this.roleService.findAllByOpportunity(opportunityId);
    res.json({ status: 'success', data: roles });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const role = await this.roleService.findById(id);
    if (!role) {
      return res.status(404).json({ status: 'error', message: 'Role not found' });
    }
    res.json({ status: 'success', data: role });
  }

  async create(req: Request, res: Response) {
    const parseResult = insertOpportunityRoleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.issues.map(issue => issue.message) });
    }

    try {
      // Extract assignedMembers from request body
      const { assignedMembers, ...roleData } = req.body;

      // First create the role
      const role = await this.roleService.create(roleData);

      // Then assign members if provided
      if (Array.isArray(assignedMembers) && assignedMembers.length > 0) {
        await this.roleService.updateAssignedMembers(role.id, assignedMembers);
      }

      // Fetch the created role with its assigned members
      const createdRole = await this.roleService.findById(role.id);
      res.status(201).json({ status: 'success', data: createdRole });
    } catch (error) {
      console.error('Failed to create role:', error);
      res.status(500).json({ status: 'error', message: 'Failed to create role' });
    }
  }

  async update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const parseResult = insertOpportunityRoleSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.issues.map(issue => issue.message) });
    }

    try {
      // Extract assignedMembers from request body
      const { assignedMembers, ...roleData } = req.body;

      // First update the role data
      await this.roleService.update(id, roleData);

      // Then update assigned members if provided
      if (Array.isArray(assignedMembers)) {
        await this.roleService.updateAssignedMembers(id, assignedMembers);
      }

      // Fetch the updated role with its assigned members
      const updatedRole = await this.roleService.findById(id);
      res.json({ status: 'success', data: updatedRole });
    } catch (error) {
      console.error('Failed to update role:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update role' });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await this.roleService.delete(id);
    res.status(204).send();
  }

  // New endpoints for managing assigned members
  async assignMember(req: Request, res: Response) {
    const { id: roleId } = req.params;
    const parseResult = assignMemberSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.issues.map(issue => issue.message) });
    }

    try {
      await this.roleService.assignMember(roleId, parseResult.data.personId);
      res.json({ status: 'success', message: 'Member assigned successfully' });
    } catch (error) {
      console.error('Failed to assign member:', error);
      res.status(500).json({ status: 'error', message: 'Failed to assign member' });
    }
  }

  async unassignMember(req: Request, res: Response) {
    const { id: roleId } = req.params;
    const parseResult = assignMemberSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.issues.map(issue => issue.message) });
    }

    try {
      await this.roleService.unassignMember(roleId, parseResult.data.personId);
      res.json({ status: 'success', message: 'Member unassigned successfully' });
    } catch (error) {
      console.error('Failed to unassign member:', error);
      res.status(500).json({ status: 'error', message: 'Failed to unassign member' });
    }
  }

  async updateAssignedMembers(req: Request, res: Response) {
    const { id: roleId } = req.params;
    const parseResult = updateAssignedMembersSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.issues.map(issue => issue.message) });
    }

    try {
      await this.roleService.updateAssignedMembers(roleId, parseResult.data.personIds);
      res.json({ status: 'success', message: 'Assigned members updated successfully' });
    } catch (error) {
      console.error('Failed to update assigned members:', error);
      res.status(500).json({ status: 'error', message: 'Failed to update assigned members' });
    }
  }
} 