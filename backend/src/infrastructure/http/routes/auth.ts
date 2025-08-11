import { Router, Response } from 'express';
import { authenticateToken } from '../../../interfaces/http/middlewares/auth.middleware';
import { authorize } from '../../../interfaces/http/middlewares/authorization.middleware';
import { AuthenticatedRequest } from '../../../domain/interfaces/auth.interface';
import { container } from '../../container';
import { AuthController } from '../controllers/auth.controller';
import { TYPES } from '../../../shared/types';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization endpoints
 */

const authRouter = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email and password
 *     description: Authenticates a user and returns their profile and role.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@ddroidd.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Email and password are required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Email and password are required
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
authRouter.post('/login', (req, res) => authController.login(req, res));

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Returns the profile of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Access token required.
 *       403:
 *         description: Invalid or expired token / Insufficient permissions.
 */
authRouter.get(
  '/profile',
  authenticateToken,
  authorize(['admin', 'hr_manager', 'recruiter', 'employee']), // Example: Allow all authenticated roles
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      message: 'You have accessed the protected profile route!',
      user: req.user,
    });
  }
);

/**
 * @swagger
 * /api/v1/auth/technical-token:
 *   post:
 *     summary: Generate technical JWT token for API access
 *     description: |
 *       Authenticates a user with credentials and returns a JWT token for API access.
 *       This token can be used with Bearer authentication for secure API calls.
 *       
 *       **Features:**
 *       - JWT token with configurable expiration
 *       - Role-based permissions included in token
 *       - Client identification for tracking
 *       - Scope-based access control
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: admin@ddroidd.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: password123
 *               clientId:
 *                 type: string
 *                 description: Client identifier (optional)
 *                 example: frontend
 *                 default: api-client
 *               expiresIn:
 *                 type: string
 *                 description: Token expiration time
 *                 example: 24h
 *                 default: 24h
 *                 enum: [1h, 6h, 12h, 24h, 7d]
 *               scope:
 *                 type: string
 *                 description: Space-separated scopes for token access
 *                 example: api:read api:write
 *     responses:
 *       200:
 *         description: Technical token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for Bearer authentication
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     tokenType:
 *                       type: string
 *                       example: Bearer
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:00:00Z
 *                     expiresIn:
 *                       type: integer
 *                       description: Seconds until expiration
 *                       example: 86400
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                     tokenInfo:
 *                       type: object
 *                       properties:
 *                         clientId:
 *                           type: string
 *                         scope:
 *                           type: string
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
authRouter.post('/technical-token', (req, res) => authController.generateTechnicalToken(req, res));

/**
 * @swagger
 * /api/v1/auth/validate-token:
 *   post:
 *     summary: Validate a JWT token
 *     description: Validates a JWT token and returns its payload and expiration info
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token to validate
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     error:
 *                       type: string
 *                     payload:
 *                       type: object
 *                     expiresIn:
 *                       type: integer
 *                     stats:
 *                       type: object
 */
authRouter.post('/validate-token', (req, res) => authController.validateToken(req, res));

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh a JWT token
 *     description: Generates a new token with extended expiration, revoking the old one
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Current JWT token to refresh
 *               expiresIn:
 *                 type: string
 *                 description: New token expiration time
 *                 default: 24h
 *               clientId:
 *                 type: string
 *                 description: Client identifier
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired token
 */
authRouter.post('/refresh-token', (req, res) => authController.refreshToken(req, res));

/**
 * @swagger
 * /api/v1/auth/revoke-token:
 *   post:
 *     summary: Revoke a JWT token
 *     description: Revokes a JWT token, making it invalid for future use
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token to revoke
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *       400:
 *         description: Invalid token or token already revoked
 */
authRouter.post('/revoke-token', (req, res) => authController.revokeToken(req, res));

export default authRouter; 