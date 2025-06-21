import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { RoleService } from '../../../domain/opportunity/services/role.service';
import { TYPES } from '../../../shared/types';
import { insertOpportunityRoleSchema } from '../../../../db/schema/opportunity-roles.schema';

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
} 