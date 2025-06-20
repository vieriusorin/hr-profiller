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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Opportunity'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 filters:
 *                   $ref: '#/components/schemas/FilterParams'
 *                 search:
 *                   $ref: '#/components/schemas/SearchParams'
 *                 sort:
 *                   $ref: '#/components/schemas/SortParams'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       description: Number of items in current page
 *                       example: 5
 *                     filtered:
 *                       type: integer
 *                       description: Total items after filtering
 *                       example: 25
 *                     total:
 *                       type: integer
 *                       description: Total items in database
 *                       example: 25
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Response timestamp
 *                       example: "2025-06-19T11:47:43.584Z"
 *                     endpoint:
 *                       type: string
 *                       description: API endpoint that was called
 *                       example: "/api/v1/opportunities"
 *             examples:
 *               all_opportunities:
 *                 summary: All opportunities without filters
 *                 value:
 *                   status: "success"
 *                   data:
 *                     - id: "93def6e5-7237-4960-8855-f3f9f44b0a71"
 *                       opportunityName: "E-Commerce Platform Redesign"
 *                       clientId: "30335021-148c-4fac-9959-ce0bf7fc5d7a"
 *                       clientName: "TechCorp Inc."
 *                       expectedStartDate: "2024-03-15T00:00:00Z"
 *                       expectedEndDate: "2024-09-15T00:00:00Z"
 *                       probability: 85
 *                       status: "In Progress"
 *                       comment: "High priority client project"
 *                       isActive: true
 *                       activatedAt: "2024-01-15T10:30:00Z"
 *                       createdAt: "2024-01-10T09:00:00Z"
 *                       updatedAt: "2024-01-16T14:20:00Z"
 *                       isHighProbability: true
 *                       duration: 184
 *                       isExpiringSoon: false
 *                     - id: "456e7890-e89b-12d3-a456-426614174001"
 *                       opportunityName: "Mobile App Development"
 *                       clientId: "789e0123-e89b-12d3-a456-426614174002"
 *                       clientName: "StartupXYZ"
 *                       expectedStartDate: "2024-02-01T00:00:00Z"
 *                       expectedEndDate: "2024-08-01T00:00:00Z"
 *                       probability: 70
 *                       status: "In Progress"
 *                       comment: "React Native application"
 *                       isActive: true
 *                       activatedAt: "2024-01-20T11:00:00Z"
 *                       createdAt: "2024-01-18T10:00:00Z"
 *                       updatedAt: "2024-01-20T11:00:00Z"
 *                       isHighProbability: false
 *                       duration: 182
 *                       isExpiringSoon: false
 *                   pagination:
 *                     page: 1
 *                     limit: 10
 *                     total: 2
 *                     totalPages: 1
 *                     hasNextPage: false
 *                     hasPreviousPage: false
 *                     nextPage: null
 *                     previousPage: null
 *                   meta:
 *                     count: 2
 *                     filtered: 2
 *                     total: 2
 *                     timestamp: "2025-06-19T11:47:43.584Z"
 *                     endpoint: "/api/v1/opportunities"
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