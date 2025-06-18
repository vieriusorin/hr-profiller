import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { container } from '../../container'; // Dependency injection container

const router = Router();
const candidateController = container.resolve(CandidateController);

/**
 * @swagger
 * /api/v1/candidates/metrics:
 *   get:
 *     summary: Get candidate metrics
 *     description: Retrieve various metrics about the application including recruitment funnel stages and summary
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Successfully retrieved metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     recruitmentFunnel:
 *                       type: object
 *                       properties:
 *                         stages:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: Applied
 *                               count:
 *                                 type: number
 *                                 example: 10
 *                               percentage:
 *                                 type: number
 *                                 example: 25.5
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalCandidates:
 *                               type: number
 *                               example: 40
 *                 meta:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     endpoint:
 *                       type: string
 *                       example: /api/v1/candidates/metrics
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [error]
 *                   example: error
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: An unexpected error occurred
 *                     code:
 *                       type: string
 *                       example: INTERNAL_ERROR
 *                     stack:
 *                       type: string
 *                       description: Only included in development environment
 */
router.get('/metrics', (req, res) => candidateController.getMetrics(req, res));

export default router;
