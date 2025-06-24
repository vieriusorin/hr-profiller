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

export default authRouter; 