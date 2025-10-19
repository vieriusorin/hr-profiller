import { Router, Request, Response } from 'express';
import { RoleMatchingController } from '../controllers/role-matching.controller';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';
import { authenticateJWT, requirePermissions, requireScope, rateLimitByClient } from '../../../interfaces/http/middlewares/jwt-technical-auth.middleware';

const router = Router();
const roleMatchingController = container.get<RoleMatchingController>(TYPES.RoleMatchingController);

/**
 * @swagger
 * /api/v1/role-matching/find-matches:
 *   post:
 *     summary: Find best matches for roles
 *     description: |
 *       Find the best person-to-role matches using AI analysis.
 *       Supports matching for a specific role, all roles in an opportunity, or specific people.
 *     tags: [Role Matching]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of a specific role to match (optional)
 *               opportunityId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of an opportunity to match all its roles (optional)
 *               personIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of person UUIDs to consider (optional, defaults to all persons)
 *               minMatchScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Minimum match score to return (0-100)
 *               limit:
 *                 type: number
 *                 minimum: 1
 *                 description: Maximum number of matches to return
 *             oneOf:
 *               - required: [roleId]
 *               - required: [opportunityId]
 *     responses:
 *       200:
 *         description: Successfully found matches
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/find-matches',
  authenticateJWT,
  requirePermissions(['read:role-matching', 'read:*']),
  requireScope(['api:read', 'api:write']),
  rateLimitByClient(),
  (req: Request, res: Response) => roleMatchingController.findMatches(req, res)
);

/**
 * @swagger
 * /api/v1/role-matching/match:
 *   post:
 *     summary: Match a single person to a single role
 *     description: Get detailed AI-powered match analysis for a specific person-role pair
 *     tags: [Role Matching]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personId
 *               - roleId
 *             properties:
 *               personId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the person to match
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the role to match
 *     responses:
 *       200:
 *         description: Successfully matched person to role
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/match',
  authenticateJWT,
  requirePermissions(['read:role-matching', 'read:*']),
  requireScope(['api:read', 'api:write']),
  rateLimitByClient(),
  (req: Request, res: Response) => roleMatchingController.matchPersonToRole(req, res)
);

/**
 * @swagger
 * /api/v1/role-matching/role/{roleId}/candidates:
 *   get:
 *     summary: Get top candidates for a specific role
 *     description: Retrieve the best-matching candidates for a role, sorted by match score
 *     tags: [Role Matching]
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the role
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         description: Maximum number of candidates to return
 *     responses:
 *       200:
 *         description: Successfully retrieved top candidates
 *       400:
 *         description: Invalid role ID
 *       500:
 *         description: Internal server error
 */
router.get('/role/:roleId/candidates',
  authenticateJWT,
  requirePermissions(['read:role-matching', 'read:*']),
  requireScope(['api:read', 'api:write']),
  rateLimitByClient(),
  (req: Request, res: Response) => roleMatchingController.getTopCandidatesForRole(req, res)
);

/**
 * @swagger
 * /api/v1/role-matching/person/{personId}/roles:
 *   get:
 *     summary: Get all role matches for a specific person
 *     description: Retrieve all roles that match a person's profile, optionally filtered by opportunity
 *     tags: [Role Matching]
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the person
 *       - in: query
 *         name: opportunityId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional UUID of an opportunity to filter roles
 *     responses:
 *       200:
 *         description: Successfully retrieved role matches
 *       400:
 *         description: Invalid person ID or opportunity ID
 *       500:
 *         description: Internal server error
 */
router.get('/person/:personId/roles',
  authenticateJWT,
  requirePermissions(['read:role-matching', 'read:*']),
  requireScope(['api:read', 'api:write']),
  rateLimitByClient(),
  (req: Request, res: Response) => roleMatchingController.getRolesForPerson(req, res)
);

/**
 * @swagger
 * /api/v1/role-matching/opportunity/{opportunityId}/matches:
 *   get:
 *     summary: Get all role matches for an entire opportunity
 *     description: Retrieve matches for all roles within an opportunity
 *     tags: [Role Matching]
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the opportunity
 *       - in: query
 *         name: minMatchScore
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 0
 *           maximum: 100
 *         description: Minimum match score to include
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum number of matches to return
 *     responses:
 *       200:
 *         description: Successfully retrieved opportunity matches
 *       400:
 *         description: Invalid opportunity ID
 *       500:
 *         description: Internal server error
 */
router.get('/opportunity/:opportunityId/matches',
  authenticateJWT,
  requirePermissions(['read:role-matching', 'read:*']),
  requireScope(['api:read', 'api:write']),
  rateLimitByClient(),
  (req: Request, res: Response) => roleMatchingController.getMatchesForOpportunity(req, res)
);

export default router;

