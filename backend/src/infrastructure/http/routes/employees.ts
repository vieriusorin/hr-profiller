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
   *       - in: query
   *         name: includeRelated
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include related data (skills, technologies, education) in response
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
   *       - in: query
   *         name: includeRelated
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include related data (skills, technologies, education) in response
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

  // ===== SKILLS MANAGEMENT ENDPOINTS =====

  /**
   * @swagger
   * /api/v1/employees/{id}/skills:
   *   post:
   *     summary: Add a skill to an employee (auto-creates skill if not exists)
   *     tags: [Employee Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateEmployeeSkill'
   *           examples:
   *             javascript_skill:
   *               summary: Add JavaScript skill (auto-created if not exists)
   *               value:
   *                 skillName: "JavaScript"
   *                 proficiencyLevel: "ADVANCED"
   *                 yearsOfExperience: "5"
   *                 lastUsed: "2024-01-15T00:00:00Z"
   *                 isCertified: true
   *                 certificationName: "JavaScript Professional Certificate"
   *                 certificationDate: "2023-06-15T00:00:00Z"
   *                 notes: "Extensive experience with React and Node.js"
   *             python_skill:
   *               summary: Add Python programming skill
   *               value:
   *                 skillName: "Python"
   *                 proficiencyLevel: "EXPERT"
   *                 yearsOfExperience: "6"
   *                 lastUsed: "2024-01-10T00:00:00Z"
   *                 isCertified: false
   *                 notes: "Backend development and data analysis"
   *             communication_skill:
   *               summary: Add soft skill
   *               value:
   *                 skillName: "Communication"
   *                 proficiencyLevel: "ADVANCED"
   *                 yearsOfExperience: "8"
   *                 notes: "Strong verbal and written communication skills"
   *             leadership_skill:
   *               summary: Add leadership skill
   *               value:
   *                 skillName: "Team Leadership"
   *                 proficiencyLevel: "INTERMEDIATE"
   *                 yearsOfExperience: "3"
   *                 notes: "Led cross-functional teams on multiple projects"
   *     responses:
   *       201:
   *         description: Skill added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Skill added successfully"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.post('/:id/skills', (req, res) => employeeController.addSkill(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/skills/{skillId}:
   *   patch:
   *     summary: Update an employee's skill
   *     tags: [Employee Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee ID
   *       - in: path
   *         name: skillId
   *         required: true
   *         schema:
   *           type: string
   *         description: The skill ID (UUID) or skill name (e.g., "JavaScript", "Python")
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateEmployeeSkill'
   *           examples:
   *             update_proficiency:
   *               summary: Update skill proficiency
   *               value:
   *                 proficiencyLevel: "EXPERT"
   *                 yearsOfExperience: "7"
   *                 notes: "Updated to expert level after recent certification"
   *     responses:
   *       200:
   *         description: Skill updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Skill updated successfully"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.patch('/:id/skills/:skillId', (req, res) => employeeController.updateSkill(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/skills/{skillId}:
   *   delete:
   *     summary: Remove a skill from an employee
   *     tags: [Employee Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee ID
   *       - in: path
   *         name: skillId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The skill ID (UUID) or skill name (e.g., "JavaScript", "Python")
   *     responses:
   *       204:
   *         description: Skill removed successfully
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.delete('/:id/skills/:skillId', (req, res) => employeeController.removeSkill(req, res));

  // ===== TECHNOLOGIES MANAGEMENT ENDPOINTS =====

  /**
   * @swagger
   * /api/v1/employees/{id}/technologies:
   *   post:
   *     summary: Add a technology to an employee (auto-creates technology if not exists)
   *     tags: [Employee Technologies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateEmployeeTechnology'
   *           examples:
   *             react_technology:
   *               summary: Add React technology (auto-created if not exists)
   *               value:
   *                 technologyName: "React"
   *                 proficiencyLevel: "ADVANCED"
   *                 yearsOfExperience: "5"
   *                 lastUsed: "2024-01-15T00:00:00Z"
   *                 context: "Frontend Development"
   *                 projectName: "E-commerce Platform"
   *                 description: "Built dynamic web applications with modern JavaScript"
   *             python_technology:
   *               summary: Add Python technology
   *               value:
   *                 technologyName: "Python"
   *                 proficiencyLevel: "EXPERT"
   *                 yearsOfExperience: "6"
   *                 lastUsed: "2024-01-10T00:00:00Z"
   *                 context: "Backend Development"
   *                 projectName: "Data Analytics Platform"
   *                 description: "Developed REST APIs and data processing pipelines"
   *             nodejs_technology:
   *               summary: Add Node.js technology
   *               value:
   *                 technologyName: "Node.js"
   *                 proficiencyLevel: "INTERMEDIATE"
   *                 yearsOfExperience: "3"
   *                 lastUsed: "2024-01-08T00:00:00Z"
   *                 context: "Backend Development"
   *                 projectName: "Microservices Architecture"
   *                 description: "Built scalable backend services and APIs"
   *             database_technology:
   *               summary: Add Database technology
   *               value:
   *                 technologyName: "PostgreSQL"
   *                 proficiencyLevel: "ADVANCED"
   *                 yearsOfExperience: "4"
   *                 lastUsed: "2024-01-12T00:00:00Z"
   *                 context: "Database Development"
   *                 projectName: "HR Management System"
   *                 description: "Designed and optimized database schemas and queries"
   *     responses:
   *       201:
   *         description: Technology added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Technology added successfully"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.post('/:id/technologies', (req, res) => employeeController.addTechnology(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/technologies/{technologyId}:
   *   patch:
   *     summary: Update an employee's technology
   *     tags: [Employee Technologies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee ID
   *       - in: path
   *         name: technologyId
   *         required: true
   *         schema:
   *           type: string
   *         description: The technology ID (UUID) or technology name (e.g., "React", "Node.js")
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateEmployeeTechnology'
   *           examples:
   *             update_technology:
   *               summary: Update technology details
   *               value:
   *                 proficiencyLevel: "EXPERT"
   *                 yearsOfExperience: "6"
   *                 context: "Full-stack Development"
   *                 description: "Leading React development across multiple projects"
   *     responses:
   *       200:
   *         description: Technology updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Technology updated successfully"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.patch('/:id/technologies/:technologyId', (req, res) => employeeController.updateTechnology(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/technologies/{technologyId}:
   *   delete:
   *     summary: Remove a technology from an employee
   *     tags: [Employee Technologies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee ID
   *       - in: path
   *         name: technologyId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The technology ID (UUID) or technology name (e.g., "React", "Node.js")
   *     responses:
   *       204:
   *         description: Technology removed successfully
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.delete('/:id/technologies/:technologyId', (req, res) => employeeController.removeTechnology(req, res));

  // ===== EDUCATION MANAGEMENT ENDPOINTS =====

  /**
   * @swagger
   * /api/v1/employees/{id}/education:
   *   post:
   *     summary: Add education to an employee (accepts any institution name)
   *     tags: [Employee Education]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateEmployeeEducation'
   *           examples:
   *             bachelors_degree:
   *               summary: Add Bachelor's degree
   *               value:
   *                 institution: "Stanford University"
   *                 degree: "Bachelor of Science"
   *                 fieldOfStudy: "Computer Science"
   *                 startDate: "2018-09-01T00:00:00Z"
   *                 graduationDate: "2022-06-15T00:00:00Z"
   *                 gpa: "3.8"
   *                 description: "Focused on software engineering and algorithms"
   *             online_certification:
   *               summary: Add online certification
   *               value:
   *                 institution: "Coursera"
   *                 degree: "Professional Certificate"
   *                 fieldOfStudy: "Data Science"
   *                 startDate: "2023-01-15T00:00:00Z"
   *                 graduationDate: "2023-06-30T00:00:00Z"
   *                 description: "Completed Google Data Analytics Professional Certificate"
   *             bootcamp:
   *               summary: Add coding bootcamp
   *               value:
   *                 institution: "General Assembly"
   *                 degree: "Certificate"
   *                 fieldOfStudy: "Full Stack Web Development"
   *                 startDate: "2023-03-01T00:00:00Z"
   *                 graduationDate: "2023-08-15T00:00:00Z"
   *                 description: "Intensive 24-week full-stack development program"
   *             local_college:
   *               summary: Add local college degree
   *               value:
   *                 institution: "City Community College"
   *                 degree: "Associate Degree"
   *                 fieldOfStudy: "Information Technology"
   *                 startDate: "2020-09-01T00:00:00Z"
   *                 graduationDate: "2022-05-15T00:00:00Z"
   *                 gpa: "3.5"
   *                 description: "Foundation in IT systems and networking"
   *     responses:
   *       201:
   *         description: Education added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Education added successfully"
   *                     educationId:
   *                       type: string
   *                       format: uuid
   *                       example: "550e8400-e29b-41d4-a716-446655440002"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.post('/:id/education', (req, res) => employeeController.addEducation(req, res));

  /**
   * @swagger
   * /api/v1/employees/education/{educationId}:
   *   patch:
   *     summary: Update education record
   *     tags: [Employee Education]
   *     parameters:
   *       - in: path
   *         name: educationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The education record ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateEmployeeEducation'
   *           examples:
   *             update_gpa:
   *               summary: Update GPA and description
   *               value:
   *                 gpa: "3.9"
   *                 description: "Graduated summa cum laude with honors in Computer Science"
   *     responses:
   *       200:
   *         description: Education updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: "Education updated successfully"
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.patch('/education/:educationId', (req, res) => employeeController.updateEducation(req, res));

  /**
   * @swagger
   * /api/v1/employees/education/{educationId}:
   *   delete:
   *     summary: Remove education record
   *     tags: [Employee Education]
   *     parameters:
   *       - in: path
   *         name: educationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The education record ID
   *     responses:
   *       204:
   *         description: Education removed successfully
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.delete('/education/:educationId', (req, res) => employeeController.removeEducation(req, res));

  // ===== RAG SEARCH ENDPOINTS =====

  /**
   * @swagger
   * /api/v1/employees/search/skills:
   *   post:
   *     summary: Search employees by skills (RAG functionality)
   *     tags: [Employee Search]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - skills
   *             properties:
   *               skills:
   *                 type: array
   *                 items:
   *                   type: string
   *                 minItems: 1
   *                 description: Array of skill names to search for
   *                 example: ["JavaScript", "React", "Node.js"]
   *           examples:
   *             frontend_skills:
   *               summary: Search for frontend developers
   *               value:
   *                 skills: ["JavaScript", "React", "CSS", "HTML"]
   *             backend_skills:
   *               summary: Search for backend developers
   *               value:
   *                 skills: ["Node.js", "Python", "PostgreSQL", "Docker"]
   *     responses:
   *       200:
   *         description: List of employees matching the skills
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Employee'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                       description: Number of employees found
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.post('/search/skills', (req, res) => employeeController.searchBySkills(req, res));

  /**
   * @swagger
   * /api/v1/employees/search/technologies:
   *   post:
   *     summary: Search employees by technologies (RAG functionality)
   *     tags: [Employee Search]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - technologies
   *             properties:
   *               technologies:
   *                 type: array
   *                 items:
   *                   type: string
   *                 minItems: 1
   *                 description: Array of technology names to search for
   *                 example: ["React", "Angular", "Vue.js"]
   *           examples:
   *             web_frameworks:
   *               summary: Search for web framework expertise
   *               value:
   *                 technologies: ["React", "Angular", "Vue.js"]
   *             cloud_technologies:
   *               summary: Search for cloud technology expertise
   *               value:
   *                 technologies: ["AWS", "Docker", "Kubernetes"]
   *     responses:
   *       200:
   *         description: List of employees matching the technologies
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Employee'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                       description: Number of employees found
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.post('/search/technologies', (req, res) => employeeController.searchByTechnologies(req, res));

  /**
   * @swagger
   * /api/v1/employees/search/education:
   *   post:
   *     summary: Search employees by education (RAG functionality)
   *     tags: [Employee Search]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               institution:
   *                 type: string
   *                 description: Institution name (partial match)
   *                 example: "Stanford"
   *               degree:
   *                 type: string
   *                 description: Degree type (partial match)
   *                 example: "Bachelor"
   *               fieldOfStudy:
   *                 type: string
   *                 description: Field of study (partial match)
   *                 example: "Computer Science"
   *             minProperties: 1
   *           examples:
   *             by_institution:
   *               summary: Search by institution
   *               value:
   *                 institution: "MIT"
   *             by_field:
   *               summary: Search by field of study
   *               value:
   *                 fieldOfStudy: "Computer Science"
   *             combined_search:
   *               summary: Combined education search
   *               value:
   *                 institution: "Stanford"
   *                 degree: "Master"
   *                 fieldOfStudy: "Computer Science"
   *     responses:
   *       200:
   *         description: List of employees matching the education criteria
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Employee'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                       description: Number of employees found
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.post('/search/education', (req, res) => employeeController.searchByEducation(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/searchable-content:
   *   get:
   *     summary: Get employee's RAG-optimized searchable content
   *     tags: [Employee Search]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The employee ID
   *     responses:
   *       200:
   *         description: Employee's searchable content for RAG applications
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   type: object
   *                   properties:
   *                     employeeId:
   *                       type: string
   *                       format: uuid
   *                       description: Employee ID
   *                     searchableContent:
   *                       type: string
   *                       description: Formatted content optimized for RAG/vector search
   *                       example: "John Doe is a Senior Software Engineer with expertise in JavaScript (Advanced, 5 years), React (Expert, 4 years), Node.js (Advanced, 3 years). Education: Bachelor of Science in Computer Science from Stanford University (2018-2022). Located in San Francisco, working on E-commerce Platform project."
   *                     skillsCount:
   *                       type: integer
   *                       description: Number of skills associated with the employee
   *                     technologiesCount:
   *                       type: integer
   *                       description: Number of technologies associated with the employee
   *                     educationCount:
   *                       type: integer
   *                       description: Number of education records associated with the employee
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *             examples:
   *               employee_content:
   *                 summary: Employee searchable content
   *                 value:
   *                   status: "success"
   *                   data:
   *                     employeeId: "123e4567-e89b-12d3-a456-426614174000"
   *                     searchableContent: "Alice Johnson is a Senior Full-Stack Developer specializing in JavaScript (Expert, 6 years), React (Expert, 5 years), Node.js (Advanced, 4 years), PostgreSQL (Intermediate, 3 years). Education includes Master of Science in Computer Science from MIT (2019-2021) and Bachelor of Engineering in Software Engineering from UC Berkeley (2015-2019). Currently working on Microservices Architecture project in San Francisco office."
   *                     skillsCount: 12
   *                     technologiesCount: 8
   *                     educationCount: 2
   *                   meta:
   *                     timestamp: "2024-01-16T15:30:00Z"
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  employeeRouter.get('/:id/searchable-content', (req, res) => employeeController.getSearchableContent(req, res));
} catch (error) {
  console.error('Error getting EmployeeController from container:', error);
  throw error;
}

export default employeeRouter; 