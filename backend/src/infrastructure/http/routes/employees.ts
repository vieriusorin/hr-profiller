import { Router } from 'express';
import { container } from '../../container';
import { EmployeeController } from '../controllers/employee.controller';
import { TYPES } from '../../../shared/types';

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management
 */
const employeeRouter = Router();

let employeeController: EmployeeController;
try {
  employeeController = container.get<EmployeeController>(TYPES.EmployeeController);

  /**
   * @swagger
   * /api/v1/employees:
   *   get:
   *     summary: Retrieve a paginated list of employees with filtering, searching, and sorting
   *     tags: [Employees]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of items per page
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term to filter employees
   *         example: "John"
   *       - in: query
   *         name: searchFields
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [firstName, lastName, fullName, email, position, location]
   *         style: form
   *         explode: true
   *         description: Fields to search in
   *         example: ["firstName", "lastName", "email"]
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [firstName, lastName, fullName, email, position, hireDate, employeeStatus, workStatus, jobGrade, location]
   *         description: Field to sort by
   *         example: "lastName"
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: Sort order
   *       - in: query
   *         name: position
   *         schema:
   *           type: string
   *         description: Filter by position (partial match)
   *         example: "Engineer"
   *       - in: query
   *         name: employeeStatus
   *         schema:
   *           type: string
   *           enum: [Active, On Leave, Inactive]
   *         description: Filter by employee status
   *       - in: query
   *         name: workStatus
   *         schema:
   *           type: string
   *           enum: [On Project, On Bench, Available]
   *         description: Filter by work status
   *       - in: query
   *         name: jobGrade
   *         schema:
   *           type: string
   *           enum: [JT, T, ST, EN, SE, C, SC, SM]
   *         description: Filter by job grade
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *         description: Filter by location (partial match)
   *         example: ""
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *     responses:
   *       200:
   *         description: A paginated list of employees with metadata
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
   *                     $ref: '#/components/schemas/Employee'
   *                 pagination:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *                 filters:
   *                   $ref: '#/components/schemas/EmployeeFilterParams'
   *                 search:
   *                   $ref: '#/components/schemas/EmployeeSearchParams'
   *                 sort:
   *                   $ref: '#/components/schemas/EmployeeSortParams'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                       description: Number of items in current page
   *                       example: 10
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
   *                       example: "2024-01-16T15:30:00Z"
   *                     endpoint:
   *                       type: string
   *                       description: API endpoint that was called
   *                       example: "/api/v1/employees"
   *             examples:
   *               all_employees:
   *                 summary: All employees without filters
   *                 value:
   *                   status: "success"
   *                   data:
   *                     - id: "550e8400-e29b-41d4-a716-446655440000"
   *                       firstName: "John"
   *                       lastName: "Doe"
   *                       fullName: "John Doe"
   *                       email: "john.doe@company.com"
   *                       position: "Senior Software Engineer"
   *                       employeeStatus: "active"
   *                       workStatus: "full-time"
   *                       jobGrade: "senior"
   *                       location: "New York"
   *                       isActive: true
   *                       salary: 120000
   *                       hourlyRate: 60
   *                       hireDate: "2022-01-15T00:00:00Z"
   *                       terminationDate: null
   *                       lastPromotionDate: "2023-06-01T00:00:00Z"
   *                       nextReviewDate: "2024-12-01T00:00:00Z"
   *                       createdAt: "2022-01-10T09:00:00Z"
   *                       updatedAt: "2024-01-15T14:30:00Z"
   *                       yearsOfExperience: 2
   *                       isInactive: false
   *                       isOnBench: false
   *                     - id: "550e8400-e29b-41d4-a716-446655440001"
   *                       firstName: "Jane"
   *                       lastName: "Smith"
   *                       fullName: "Jane Smith"
   *                       email: "jane.smith@company.com"
   *                       position: "Product Manager"
   *                       employeeStatus: "active"
   *                       workStatus: "full-time"
   *                       jobGrade: "senior"
   *                       location: "San Francisco"
   *                       isActive: true
   *                       salary: 130000
   *                       hourlyRate: 65
   *                       hireDate: "2021-03-20T00:00:00Z"
   *                       terminationDate: null
   *                       lastPromotionDate: "2023-03-20T00:00:00Z"
   *                       nextReviewDate: "2024-09-20T00:00:00Z"
   *                       createdAt: "2021-03-15T10:00:00Z"
   *                       updatedAt: "2024-02-10T16:45:00Z"
   *                       yearsOfExperience: 3
   *                       isInactive: false
   *                       isOnBench: false
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
   *                     endpoint: "/api/v1/employees"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.get('/', (req, res) => employeeController.getAll(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}:
   *   get:
   *     summary: Retrieve a single employee by ID
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee person ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: A single employee with metadata
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
   *                   $ref: '#/components/schemas/Employee'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-16T15:30:00Z"
   *             examples:
   *               success:
   *                 summary: Successful response with employee
   *                 value:
   *                   status: "success"
   *                   data:
   *                     personId: "123e4567-e89b-12d3-a456-426614174000"
   *                     firstName: "John"
   *                     lastName: "Doe"
   *                     fullName: "John Doe"
   *                     email: "john.doe@company.com"
   *                     position: "Senior Software Engineer"
   *                     employeeStatus: "Active"
   *                     workStatus: "On Project"
   *                     jobGrade: "SE"
   *                     location: "New York Office"
   *                     hireDate: "2024-01-15T00:00:00Z"
   *                     salary: 75000.00
   *                     isInactive: false
   *                     isOnBench: false
   *                   meta:
   *                     timestamp: "2024-01-16T15:30:00Z"
   *       404:
   *         description: Employee not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               notFound:
   *                 summary: Employee not found
   *                 value:
   *                   status: "error"
   *                   data:
   *                     message: "Employee not found"
   *                     code: "NOT_FOUND"
   *                   meta:
   *                     timestamp: "2024-01-16T15:30:00Z"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.get('/:id', (req, res) => employeeController.getById(req, res));

  /**
   * @swagger
   * /api/v1/employees:
   *   post:
   *     summary: Create a new employee
   *     tags: [Employees]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateEmployee'
   *           examples:
   *             create_employee:
   *               summary: Create new employee example
   *               value:
   *                 firstName: "Jane"
   *                 lastName: "Smith"
   *                 email: "jane.smith@company.com"
   *                 phone: "+1-555-0123"
   *                 hireDate: "2024-01-15"
   *                 position: "Product Manager"
   *                 employmentType: "Full-time"
   *                 salary: 95000
   *                 employeeStatus: "Active"
   *                 workStatus: "Available"
   *                 jobGrade: "SE"
   *                 location: "San Francisco"
   *     responses:
   *       201:
   *         description: Employee created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   $ref: '#/components/schemas/Employee'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.post('/', (req, res) => employeeController.create(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}:
   *   patch:
   *     summary: Partially update an existing employee
   *     description: Update specific fields of an employee. Only send the fields you want to change.
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee person ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateEmployee'
   *           examples:
   *             update_position_salary:
   *               summary: Update position and salary only
   *               value:
   *                 position: "Senior Product Manager"
   *                 salary: 105000
   *             update_work_status:
   *               summary: Update work status only
   *               value:
   *                 workStatus: "On Project"
   *             update_location:
   *               summary: Update location only
   *               value:
   *                 location: "Remote"
   *             update_personal_info:
   *               summary: Update personal information
   *               value:
   *                 phone: "+1-555-9876"
   *                 address: "456 New Street"
   *                 city: "Boston"
   *     responses:
   *       200:
   *         description: Employee updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   $ref: '#/components/schemas/Employee'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.patch('/:id', (req, res) => employeeController.update(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}:
   *   delete:
   *     summary: Delete an employee
   *     tags: [Employees]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee person ID
   *     responses:
   *       204:
   *         description: Employee deleted successfully
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.delete('/:id', (req, res) => employeeController.delete(req, res));
} catch (error) {
  console.error('Error getting EmployeeController from container:', error);
  throw error;
}

export default employeeRouter; 