import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { RoleMatchingService, RoleMatchingRequest } from '../../../domain/opportunity/services/role-matching.service';
import { TYPES } from '../../../shared/types';
import { z } from 'zod';

/**
 * @schema RoleMatchingRequest
 * @description Schema for role matching request.
 * Includes either roleId or opportunityId, along with optional filters.
 * @property roleId - The ID of the role to match against (optional).
 * @property opportunityId - The ID of the opportunity to match roles from (optional).
 * @property personIds - An array of person IDs to consider for matching (optional).
 * @property minMatchScore - Minimum match score threshold (optional).
 * @property limit - Maximum number of matches to return (optional).
 */
const roleMatchingRequestSchema = z.object({
  roleId: z.string().uuid('Role ID must be a valid UUID').optional(),
  opportunityId: z.string().uuid('Opportunity ID must be a valid UUID').optional(),
  personIds: z.array(z.string().uuid('Person ID must be a valid UUID')).optional(),
  minMatchScore: z.number().min(0).max(100).optional(),
  limit: z.number().positive().optional(),
}).refine(
  (data) => data.roleId || data.opportunityId,
  'Either roleId or opportunityId must be provided'
);

/**
 * @schema SingleMatchRequest
 * @description Schema for matching a single person to a single role.
 * @property personId - The ID of the person to be matched.
 * @property roleId - The ID of the role to match against.
 */
const singleMatchRequestSchema = z.object({
  personId: z.string().uuid('Person ID must be a valid UUID'),
  roleId: z.string().uuid('Role ID must be a valid UUID'),
});

/**
 * Role Matching Controller
 * 
 * Handles HTTP requests for AI-powered role matching functionality.
 * Provides endpoints for matching people to opportunity roles.
 */

/**
 * @class RoleMatchingController
 * @description Controller for role matching-related endpoints.
 * Handles requests for finding matches, matching a person to a role,
 * and retrieving top candidates for roles.
 * @constructor - Injects the role matching service dependency.
 * @param roleMatchingService - Service for managing role matching data and operations.
 * @method findMatches - Find best matches for roles based on criteria.
 * @method matchPersonToRole - Match a single person to a single role.
 * @method getTopCandidatesForRole - Get top candidates for a specific role.
 * @method getRolesForPerson - Get all role matches for a specific person.
 * @method getMatchesForOpportunity - Get all role matches for an entire opportunity.
 * @private roleMatchingService - Service for role matching operations.
 */
@injectable()
export class RoleMatchingController {
  constructor(
    @inject(TYPES.RoleMatchingService)
    private readonly roleMatchingService: RoleMatchingService
  ) { }

  /**
   * POST /api/v1/role-matching/find-matches
   * Find best matches for roles based on criteria
   */
  async findMatches(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = roleMatchingRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: parseResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const request: RoleMatchingRequest = parseResult.data;
      const result = await this.roleMatchingService.findMatches(request);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Find matches failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to find matches',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/v1/role-matching/match
   * Match a single person to a single role
   */
  async matchPersonToRole(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = singleMatchRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: parseResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }

      const { personId, roleId } = parseResult.data;
      const match = await this.roleMatchingService.matchPersonToRole(personId, roleId);

      res.json({
        status: 'success',
        data: match,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Match person to role failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to match person to role',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/v1/role-matching/role/:roleId/candidates
   * Get top candidates for a specific role
   */
  async getTopCandidatesForRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      // Validate roleId
      const roleIdSchema = z.string().uuid('Role ID must be a valid UUID');
      const parseResult = roleIdSchema.safeParse(roleId);

      if (!parseResult.success) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid role ID',
        });
        return;
      }

      const matches = await this.roleMatchingService.getTopCandidatesForRole(roleId, limit);

      res.json({
        status: 'success',
        data: {
          roleId,
          candidates: matches,
          count: matches.length,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get top candidates failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get top candidates',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/v1/role-matching/person/:personId/roles
   * Get all role matches for a specific person
   */
  async getRolesForPerson(req: Request, res: Response): Promise<void> {
    try {
      const { personId } = req.params;
      const opportunityId = req.query.opportunityId as string | undefined;

      // Validate personId
      const personIdSchema = z.string().uuid('Person ID must be a valid UUID');
      const parseResult = personIdSchema.safeParse(personId);

      if (!parseResult.success) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid person ID',
        });
        return;
      }

      // Validate opportunityId if provided
      if (opportunityId) {
        const oppIdSchema = z.string().uuid('Opportunity ID must be a valid UUID');
        const oppParseResult = oppIdSchema.safeParse(opportunityId);

        if (!oppParseResult.success) {
          res.status(400).json({
            status: 'error',
            message: 'Invalid opportunity ID',
          });
          return;
        }
      }

      const matches = await this.roleMatchingService.getRolesForPerson(personId, opportunityId);

      res.json({
        status: 'success',
        data: {
          personId,
          opportunityId,
          roles: matches,
          count: matches.length,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get roles for person failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get roles for person',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/v1/role-matching/opportunity/:opportunityId/matches
   * Get all role matches for an entire opportunity
   */
  async getMatchesForOpportunity(req: Request, res: Response): Promise<void> {
    try {
      const { opportunityId } = req.params;
      const minMatchScore = req.query.minMatchScore
        ? parseInt(req.query.minMatchScore as string, 10)
        : 50;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined;

      // Validate opportunityId
      const oppIdSchema = z.string().uuid('Opportunity ID must be a valid UUID');
      const parseResult = oppIdSchema.safeParse(opportunityId);

      if (!parseResult.success) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid opportunity ID',
        });
        return;
      }

      const result = await this.roleMatchingService.findMatches({
        opportunityId,
        minMatchScore,
        limit,
      });

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get matches for opportunity failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get matches for opportunity',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

