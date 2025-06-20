import { Router } from 'express';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';
import { LookupController } from '../controllers/lookup.controller';

const router = Router();
const lookupController = container.get<LookupController>(TYPES.LookupController);

/**
 * @swagger
 * /api/v1/lookup/skills:
 *   get:
 *     tags:
 *       - Lookup
 *     summary: Get all available skills
 *     description: Retrieve a list of all available skills with optional filtering and pagination. Use this endpoint to discover skills that can be added to employees.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: javascript
 *         description: Search skills by name (case-insensitive)
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *           example: Programming Language
 *         description: Filter skills by category
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *           example: 20
 *         description: Number of skills to return (default 50)
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 0
 *         description: Number of skills to skip (default 0)
 *     responses:
 *       200:
 *         description: Skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillsResponse'
 *             example:
 *               status: success
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "JavaScript"
 *                   category: "Programming Language"
 *                   description: "High-level programming language for web development"
 *                   createdAt: "2024-01-01T00:00:00Z"
 *                   updatedAt: "2024-01-01T00:00:00Z"
 *               pagination:
 *                 total: 55
 *                 limit: 50
 *                 offset: 0
 *                 hasMore: false
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/skills', (req, res) => lookupController.getSkills(req, res));

/**
 * @swagger
 * /api/v1/lookup/skills/categories:
 *   get:
 *     tags:
 *       - Lookup
 *     summary: Get skill categories
 *     description: Retrieve a list of all available skill categories
 *     responses:
 *       200:
 *         description: Skill categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesResponse'
 *             example:
 *               status: success
 *               data:
 *                 - "Programming Language"
 *                 - "Frontend Framework"
 *                 - "Database"
 *                 - "Cloud Platform"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/skills/categories', (req, res) => lookupController.getSkillCategories(req, res));

/**
 * @swagger
 * /api/v1/lookup/technologies:
 *   get:
 *     tags:
 *       - Lookup
 *     summary: Get all available technologies
 *     description: Retrieve a list of all available technologies with optional filtering and pagination. Use this endpoint to discover technologies that can be added to employees.
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: react
 *         description: Search technologies by name (case-insensitive)
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *           example: Frontend Framework
 *         description: Filter technologies by category
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *           example: 20
 *         description: Number of technologies to return (default 50)
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 0
 *         description: Number of technologies to skip (default 0)
 *     responses:
 *       200:
 *         description: Technologies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TechnologiesResponse'
 *             example:
 *               status: success
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440001"
 *                   name: "React"
 *                   category: "Frontend Framework"
 *                   description: "JavaScript library for building user interfaces"
 *                   version: "18.0"
 *                   createdAt: "2024-01-01T00:00:00Z"
 *                   updatedAt: "2024-01-01T00:00:00Z"
 *               pagination:
 *                 total: 42
 *                 limit: 50
 *                 offset: 0
 *                 hasMore: false
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/technologies', (req, res) => lookupController.getTechnologies(req, res));

/**
 * @swagger
 * /api/v1/lookup/technologies/categories:
 *   get:
 *     tags:
 *       - Lookup
 *     summary: Get technology categories
 *     description: Retrieve a list of all available technology categories
 *     responses:
 *       200:
 *         description: Technology categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesResponse'
 *             example:
 *               status: success
 *               data:
 *                 - "Frontend Framework"
 *                 - "Backend Framework"
 *                 - "Database"
 *                 - "Cloud Platform"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/technologies/categories', (req, res) => lookupController.getTechnologyCategories(req, res));

export { router as lookupRoutes }; 