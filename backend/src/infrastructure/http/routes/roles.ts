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
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Name/title of the role
 *                 example: "Senior Frontend Developer"
 *               jobGrade:
 *                 type: string
 *                 enum: ['JT', 'T', 'ST', 'EN', 'SE', 'C', 'SC', 'SM']
 *                 nullable: true
 *                 description: |
 *                   Job grade/seniority level:
 *                   - **JT** = Junior Trainee
 *                   - **T** = Trainee  
 *                   - **ST** = Senior Trainee
 *                   - **EN** = Engineer
 *                   - **SE** = Senior Engineer
 *                   - **C** = Consultant
 *                   - **SC** = Senior Consultant
 *                   - **SM** = Senior Manager
 *                 example: "SE"
 *               level:
 *                 type: string
 *                 enum: ['Low', 'Medium', 'High']
 *                 nullable: true
 *                 description: |
 *                   Opportunity priority/importance level:
 *                   - **Low** = Low priority/complexity
 *                   - **Medium** = Medium priority/complexity
 *                   - **High** = High priority/complexity
 *                 example: "High"
 *               allocation:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 nullable: true
 *                 description: Percentage of time allocated to this role (0-100%)
 *                 example: 80
 *               startDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Role start date (YYYY-MM-DD format)
 *                 example: "2024-03-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Role end date (YYYY-MM-DD format)
 *                 example: "2024-09-15"
 *               status:
 *                 type: string
 *                 enum: ['Open', 'Staffed', 'Won', 'Lost']
 *                 description: |
 *                   Current status of the role:
 *                   - **Open** = Role is available and needs to be filled
 *                   - **Staffed** = Role has been assigned to someone
 *                   - **Won** = Role was successfully filled and project won
 *                   - **Lost** = Role/opportunity was lost to competition
 *                 example: "Open"
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 1000
 *                 description: Additional notes, requirements, or comments about the role
 *                 example: "Updated requirements - now requires team leadership experience"
 *           examples:
 *             statusUpdate:
 *               summary: Update only status
 *               value:
 *                 status: "Staffed"
 *             allocationUpdate:
 *               summary: Update allocation and notes
 *               value:
 *                 allocation: 100
 *                 notes: "Increased to full-time allocation due to project urgency"
 *             comprehensive:
 *               summary: Update multiple fields
 *               value:
 *                 roleName: "Lead Frontend Developer"
 *                 jobGrade: "SC"
 *                 allocation: 90
 *                 status: "Staffed"
 *                 notes: "Promoted to lead role with increased responsibilities"
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

export default router; 