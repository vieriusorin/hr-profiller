import { Router } from 'express';
import { container } from '../../container';
import { RoleController } from '../controllers/role.controller';
import { TYPES } from '../../../shared/types';

const router = Router();
const roleController = container.get<RoleController>(TYPES.RoleController);

/**
 * @swagger
 * /api/v1/roles/opportunity/{opportunityId}:
 *   get:
 *     summary: Get all roles for an opportunity
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the opportunity
 *     responses:
 *       200:
 *         description: List of roles for the opportunity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *       404:
 *         description: Opportunity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/opportunity/:opportunityId', async (req, res, next) => {
  try {
    await roleController.getAllByOpportunity(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role UUID
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', async (req, res, next) => {
  try {
    await roleController.getById(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               opportunityId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the associated opportunity
 *               roleName:
 *                 type: string
 *                 description: Name of the role
 *               jobGrade:
 *                 type: string
 *                 nullable: true
 *                 description: Job grade level
 *               level:
 *                 type: string
 *                 nullable: true
 *                 description: Opportunity level
 *               allocation:
 *                 type: number
 *                 nullable: true
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Allocation percentage
 *               startDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Role start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Role end date
 *               status:
 *                 type: string
 *                 description: Current status of the role
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 description: Additional notes about the role
 *             required:
 *               - opportunityId
 *               - roleName
 *               - status
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', async (req, res, next) => {
  try {
    await roleController.create(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: Name of the role
 *               jobGrade:
 *                 type: string
 *                 nullable: true
 *                 description: Job grade level
 *               level:
 *                 type: string
 *                 nullable: true
 *                 description: Opportunity level
 *               allocation:
 *                 type: number
 *                 nullable: true
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Allocation percentage
 *               startDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Role start date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Role end date
 *               status:
 *                 type: string
 *                 description: Current status of the role
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 description: Additional notes about the role
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', async (req, res, next) => {
  try {
    await roleController.update(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role UUID
 *     responses:
 *       204:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await roleController.delete(req, res);
  } catch (err) {
    next(err);
  }
});

export default router; 