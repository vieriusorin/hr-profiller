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
 *     summary: Create a new role for an opportunity
 *     tags: [Roles]
 *     description: |
 *       Create a new role within an existing opportunity. Roles define specific positions needed to fulfill the opportunity requirements.
 *       
 *       **Required Fields:**
 *       - `opportunityId` - UUID of the existing opportunity
 *       - `roleName` - Descriptive name for the role (e.g., "Senior Frontend Developer", "Project Manager")
 *       - `status` - Current status of the role
 *       
 *       **Field Details:**
 *       - **opportunityId**: Must be a valid UUID of an existing opportunity
 *       - **roleName**: Descriptive role title (1-255 characters)
 *       - **jobGrade**: Employee seniority level (see enum values below)
 *       - **level**: Opportunity priority level (see enum values below)
 *       - **allocation**: Percentage of time allocated to this role (0-100)
 *       - **startDate/endDate**: Role duration (YYYY-MM-DD format)
 *       - **status**: Current role status (see enum values below)
 *       - **notes**: Additional information about the role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRole'
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
 *   patch:
 *     summary: Update a role (partial)
 *     tags: [Roles]
 *     description: |
 *       Update an existing role with partial data. Only send the fields you want to change.
 *       
 *       **Available Fields to Update:**
 *       - `roleName` - Name/title of the role
 *       - `jobGrade` - Job grade/seniority level (see enum values)
 *       - `level` - Opportunity priority level (see enum values)
 *       - `allocation` - Percentage of time allocated (0-100%)
 *       - `startDate/endDate` - Role duration (YYYY-MM-DD format)
 *       - `status` - Current role status (see enum values)
 *       - `notes` - Additional information about the role
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
 *             $ref: '#/components/schemas/UpdateRole'
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
router.patch('/:id', async (req, res, next) => {
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

/**
 * @swagger
 * /api/v1/roles/{id}/assign-member:
 *   post:
 *     summary: Assign a person to a role
 *     tags: [Roles]
 *     description: Assign a person (employee or candidate) to a specific role
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
 *               personId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the person to assign
 *             required:
 *               - personId
 *     responses:
 *       200:
 *         description: Member assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Member assigned successfully
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/assign-member', async (req, res, next) => {
  try {
    await roleController.assignMember(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/roles/{id}/unassign-member:
 *   post:
 *     summary: Unassign a person from a role
 *     tags: [Roles]
 *     description: Remove a person assignment from a specific role
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
 *               personId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the person to unassign
 *             required:
 *               - personId
 *     responses:
 *       200:
 *         description: Member unassigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Member unassigned successfully
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/unassign-member', async (req, res, next) => {
  try {
    await roleController.unassignMember(req, res);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/roles/{id}/assigned-members:
 *   put:
 *     summary: Update the full list of assigned members for a role
 *     tags: [Roles]
 *     description: Replace all current assignments with a new list of person IDs
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
 *               personIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of person UUIDs to assign to this role
 *             required:
 *               - personIds
 *     responses:
 *       200:
 *         description: Assigned members updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Assigned members updated successfully
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/assigned-members', async (req, res, next) => {
  try {
    await roleController.updateAssignedMembers(req, res);
  } catch (err) {
    next(err);
  }
});

export default router; 