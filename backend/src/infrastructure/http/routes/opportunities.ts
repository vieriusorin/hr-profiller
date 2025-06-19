import { Router } from 'express';
import { OpportunityController } from '../controllers/opportunity.controller';
import { container } from '../../container';
import { TYPES } from '../../../shared/types';

const router = Router();
const opportunityController = container.get<OpportunityController>(TYPES.OpportunityController);

/**
 * @swagger
 * /api/v1/opportunities:
 *   get:
 *     summary: Get opportunities with pagination, filtering, search, and sorting
 *     description: |
 *       Retrieve opportunities with advanced query capabilities:
 *       - **Pagination**: Control page size and navigate through results
 *       - **Filtering**: Filter by client, probability range, status, active state, dates
 *       - **Search**: Full-text search across opportunity name, client name, and comments
 *       - **Sorting**: Sort by various fields in ascending or descending order
 *     tags: [Opportunities]
 *     parameters:
 *       # Pagination parameters
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *         example: 5
 *       # Search parameters
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to find in opportunity name, client name, or comments
 *         example: "Platform"
 *       - in: query
 *         name: searchFields
 *         schema:
 *           type: string
 *         description: 'Specific fields to search in (comma-separated). Allowed values: `opportunityName`, `clientName`, `comment`'
 *         example: "opportunityName,clientName"
 *       # Filter parameters
 *       - in: query
 *         name: client
 *         schema:
 *           type: string
 *         description: Filter by client name (partial match, case-insensitive)
 *         example: "Herzog"
 *       - in: query
 *         name: probability
 *         schema:
 *           type: string
 *           pattern: '^[0-9]+-[0-9]+$'
 *         description: "Probability range filter (format: min-max)"
 *         example: "80-100"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [In Progress, On Hold, Done]
 *         description: Filter by opportunity status
 *         example: "Done"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter opportunities starting from this date
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter opportunities ending before this date
 *         example: "2025-12-31"
 *       # Sort parameters
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [opportunityName, clientName, probability, createdAt, updatedAt, status]
 *         description: Field to sort by
 *         example: "probability"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *         example: "desc"
 *       # Legacy parameters (for backward compatibility)
 *       - in: query
 *         name: _page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Legacy page parameter (use 'page' instead)
 *       - in: query
 *         name: _limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Legacy limit parameter (use 'limit' instead)
 *     responses:
 *       200:
 *         description: Successfully retrieved opportunities with enhanced metadata
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaginatedResponse'
 *                     meta:
 *                       $ref: '#/components/schemas/EnhancedMeta'
 *             examples:
 *               basic_pagination:
 *                 summary: Basic pagination example
 *                 value:
 *                   status: "success"
 *                   data:
 *                     data: []
 *                     pagination:
 *                       page: 1
 *                       limit: 5
 *                       total: 25
 *                       totalPages: 5
 *                       hasNextPage: true
 *                       hasPreviousPage: false
 *                       nextPage: 2
 *                       previousPage: null
 *                   meta:
 *                     count: 5
 *                     filtered: 25
 *                     total: 25
 *                     timestamp: "2025-06-19T11:47:43.584Z"
 *                     endpoint: "/api/v1/opportunities?page=1&limit=5"
 *               filtered_search:
 *                 summary: Filtered and searched results
 *                 value:
 *                   status: "success"
 *                   data:
 *                     data: []
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 3
 *                       totalPages: 1
 *                       hasNextPage: false
 *                       hasPreviousPage: false
 *                       nextPage: null
 *                       previousPage: null
 *                     filters:
 *                       probability: [80, 100]
 *                       status: "Done"
 *                     search:
 *                       search: "Platform"
 *                       searchFields: ["opportunityName"]
 *                     sort:
 *                       sortBy: "probability"
 *                       sortOrder: "desc"
 *                   meta:
 *                     count: 3
 *                     filtered: 3
 *                     total: 25
 *                     timestamp: "2025-06-19T11:47:43.584Z"
 *                     endpoint: "/api/v1/opportunities?search=Platform&probability=80-100&status=Done&sortBy=probability&sortOrder=desc"
 *   post:
 *     summary: Create a new opportunity
 *     description: Create a new opportunity (ID will be auto-generated by the server)
 *     tags: [Opportunities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opportunityName
 *             properties:
 *               opportunityName:
 *                 type: string
 *                 example: "E-Commerce Platform Redesign"
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               clientName:
 *                 type: string
 *                 example: "TechCorp Inc."
 *               expectedStartDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-03-15T09:00:00.000Z"
 *               expectedEndDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-09-15T17:00:00.000Z"
 *               probability:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 75
 *               status:
 *                 type: string
 *                 enum: [In Progress, On Hold, Done]
 *                 example: "In Progress"
 *               comment:
 *                 type: string
 *                 example: "High priority project"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Opportunity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Opportunity'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req, res) => opportunityController.getAll(req, res));
router.post('/', (req, res) => opportunityController.create(req, res));

/**
 * @swagger
 * /api/v1/opportunities/{id}:
 *   get:
 *     summary: Get opportunity by ID
 *     description: Retrieve a specific opportunity by its UUID
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The opportunity UUID
 *     responses:
 *       200:
 *         description: Successfully retrieved opportunity
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Opportunity'
 *       404:
 *         description: Opportunity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update opportunity
 *     description: Update an existing opportunity by its UUID
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The opportunity UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               opportunityName:
 *                 type: string
 *               clientId:
 *                 type: string
 *                 format: uuid
 *               clientName:
 *                 type: string
 *               expectedStartDate:
 *                 type: string
 *                 format: date-time
 *               expectedEndDate:
 *                 type: string
 *                 format: date-time
 *               probability:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               status:
 *                 type: string
 *                 enum: [In Progress, On Hold, Done]
 *               comment:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Opportunity updated successfully
 *       404:
 *         description: Opportunity not found
 *   delete:
 *     summary: Delete opportunity
 *     description: Delete an opportunity by its UUID
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The opportunity UUID
 *     responses:
 *       204:
 *         description: Opportunity deleted successfully
 *       404:
 *         description: Opportunity not found
 */
router.get('/:id', (req, res) => opportunityController.getById(req, res));
router.put('/:id', (req, res) => opportunityController.update(req, res));
router.delete('/:id', (req, res) => opportunityController.delete(req, res));

export default router; 