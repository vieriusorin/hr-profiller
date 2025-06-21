import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { RoleService } from '../../../domain/opportunity/services/role.service';
import { TYPES } from '../../../shared/types';
import { insertOpportunityRoleSchema } from '../../../../db/schema/opportunity-roles.schema';
import { z } from 'zod';

// Schema for assigning/unassigning members
const assignMemberSchema = z.object({
  personId: z.string().uuid('Person ID must be a valid UUID')
});

const updateAssignedMembersSchema = z.object({
  personIds: z.array(z.string().uuid('Each person ID must be a valid UUID'))
});

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
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.errors });
    }
    const role = await this.roleService.create(parseResult.data);
    res.status(201).json({ status: 'success', data: role });
  }

  async update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const parseResult = insertOpportunityRoleSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.errors });
    }
    const role = await this.roleService.update(id, parseResult.data);
    res.json({ status: 'success', data: role });
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
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.errors });
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
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.errors });
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
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: parseResult.error.errors });
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