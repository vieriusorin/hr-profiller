import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES, QueryParams } from '../../../shared/types';
import { OpportunityService } from '../../../domain/opportunity/services/opportunity.service';
import { OpportunityPresenter } from '../../../interfaces/presenters/opportunity.presenter';
import { CreateOpportunitySchema, TypeNewOpportunity, TypeOpportunity, TypeUpdateOpportunity, UpdateOpportunitySchema } from '../../../../db/schema';
import { QueryParser } from '../../../shared/utils/query-parser';

type CreateOpportunityRequest = Request<{}, QueryParams, TypeOpportunity>;

@injectable()
export class OpportunityController {
  private readonly presenter = new OpportunityPresenter();

  constructor(
    @inject(TYPES.OpportunityService) 
    private readonly opportunityService: OpportunityService
  ) {}

  async getAll(req: CreateOpportunityRequest, res: Response): Promise<void> {
    try {
      const opportunities = await this.opportunityService.getAllOpportunities();
    
      // Parse query parameters
      const queryParams = QueryParser.parseAll(req);
      
      // Process the collection using the presenter's internal methods
      const { processedData, totalFiltered, totalOriginal } = (this.presenter as any).processCollection(opportunities, queryParams);
      const presentedData = this.presenter.presentCollection(processedData);
      
      // Create pagination metadata
      const { page = 1, limit = 10 } = queryParams;
      const totalPages = Math.ceil(totalFiltered / limit);
      const pagination = {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      };

      // Create the response with flatter structure
      const response = {
        status: 'success' as const,
        data: presentedData,
        pagination,
        filters: queryParams.filters,
        search: queryParams.search ? { search: queryParams.search, searchFields: queryParams.searchFields } : undefined,
        sort: queryParams.sortBy ? { sortBy: queryParams.sortBy, sortOrder: queryParams.sortOrder } : undefined,
        meta: {
          count: presentedData.length,
          filtered: totalFiltered,
          total: totalOriginal,
          timestamp: new Date().toISOString(),
          endpoint: req.originalUrl,
        }
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }
  

  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const opportunity = await this.opportunityService.getOpportunityById(id);
      
      if (!opportunity) {
        const errorResponse = this.presenter.error({ message: 'Opportunity not found', code: 'NOT_FOUND' });
        res.status(404).json(errorResponse);
        return;
      }

      const response = this.presenter.success(opportunity);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching opportunity:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async create(req: Request<{}, {}, TypeNewOpportunity>, res: Response): Promise<void> {
    try {
      const opportunityValidation = CreateOpportunitySchema.safeParse(req.body);
      
      if (!opportunityValidation.success) {
        const errorResponse = this.presenter.error({ 
          message: 'Invalid request body', 
          code: 'VALIDATION_ERROR',
          details: opportunityValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }
      
      const opportunityData = opportunityValidation.data;

      const opportunity = await this.opportunityService.createOpportunity(opportunityData);
      const response = this.presenter.success(opportunity);
      res.status(201).json(response);
    } catch (error: any) {
      console.error('Error creating opportunity:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async update(req: Request<{ id: string }, {}, TypeUpdateOpportunity>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const opportunityValidation = UpdateOpportunitySchema.safeParse(req.body);

      if (!opportunityValidation.success) {
        const errorResponse = this.presenter.error({ 
          message: 'Invalid request body', 
          code: 'VALIDATION_ERROR',
          details: opportunityValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const opportunity = await this.opportunityService.updateOpportunity(id, opportunityValidation.data);
      const response = this.presenter.success(opportunity);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error updating opportunity:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.opportunityService.deleteOpportunity(id);

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting opportunity:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }
} 