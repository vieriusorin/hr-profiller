import { Router } from 'express';
import { container } from '../../container';
import { EmployeeController } from '../controllers/employee.controller';
import { TYPES } from '../../../shared/types';

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management (combined Person + Employment data and Employment operations)
 */
const employeeRouter = Router();

let employeeController: EmployeeController;
try {
  employeeController = container.get<EmployeeController>(TYPES.EmployeeController);

  /**
   * @swagger
   * /api/v1/employees:
   *   get:
   *     summary: Retrieve a paginated list of employees (Person + Employment data)
   *     tags: [Employees]
   *     description: Get all employees combining Person and Employment domain data
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
   *         name: location
   *         schema:
   *           type: string
   *         description: Filter by location (partial match)
   *     responses:
   *       200:
   *         description: A paginated list of employees with Person and Employment data
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
   *                     $ref: '#/components/schemas/EmployeeProfile'
   *                 pagination:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     count:
   *                       type: integer
   *                     filtered:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   */
  employeeRouter.get('/', (req, res) => employeeController.getAll(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}:
   *   get:
   *     summary: Get employee by ID (Person + Employment data)
   *     tags: [Employees]
   *     description: Retrieve a specific employee's complete profile
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Employee ID
   *     responses:
   *       200:
   *         description: Employee profile with Person and Employment data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   $ref: '#/components/schemas/EmployeeProfile'
   *       404:
   *         description: Employee not found
   */
  employeeRouter.get('/:id', (req, res) => employeeController.getById(req, res));

  /**
   * @swagger
   * /api/v1/employees:
   *   post:
   *     summary: Create a new employee
   *     tags: [Employees]
   *     description: |
   *       Create a new employee with comprehensive personal and employment information.
   *       
   *       **Request Structure:**
   *       The request body must contain two objects:
   *       - `person` - Personal information (required)
   *       - `employment` - Employment details (required)
   *       
   *       **Required Fields:**
   *       - `person.firstName` - Employee's first name
   *       - `person.lastName` - Employee's last name  
   *       - `person.email` - Employee's email address (must be unique)
   *       - `employment.position` - Job title/position
   *       
   *       **Optional Personal Information:**
   *       - `person.fullName` - Full name (auto-generated if not provided)
   *       - `person.phone` - Phone number
   *       - `person.birthDate` - Date of birth (YYYY-MM-DD format)
   *       - `person.address` - Home address
   *       - `person.city` - City of residence
   *       - `person.country` - Country of residence
   *       - `person.notes` - Personal notes about the employee
   *       
   *       **Optional Employment Information:**
   *       - `employment.hireDate` - Date when employee was hired (YYYY-MM-DD format)
   *       - `employment.location` - Work location
   *       - `employment.salary` - Annual salary amount
   *       - `employment.hourlyRate` - Hourly rate (for hourly employees)
   *       - `employment.employmentType` - Type of employment (e.g., "Full-time", "Part-time", "Contract")
   *       - `employment.workStatus` - Work assignment status
   *       - `employment.employeeStatus` - Current status
   *       - `employment.managerId` - UUID of the employee's manager
   *       - `employment.notes` - Employment-related notes
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [person, employment]
   *             properties:
   *               person:
   *                 type: object
   *                 required: [firstName, lastName, email]
   *                 properties:
   *                   firstName:
   *                     type: string
   *                     minLength: 1
   *                     description: First name of the employee
   *                     example: "Jane"
   *                   lastName:
   *                     type: string
   *                     minLength: 1
   *                     description: Last name of the employee
   *                     example: "Smith"
   *                   fullName:
   *                     type: string
   *                     description: Full name (auto-generated if not provided)
   *                     example: "Jane Smith"
   *                   email:
   *                     type: string
   *                     format: email
   *                     description: Email address of the employee
   *                     example: "jane.smith@company.com"
   *                   phone:
   *                     type: string
   *                     description: Phone number of the employee
   *                     example: "+1-555-0123"
   *                   birthDate:
   *                     type: string
   *                     description: Birth date of the employee (YYYY-MM-DD format)
   *                     example: "1990-05-15"
   *                   address:
   *                     type: string
   *                     description: Address of the employee
   *                     example: "123 Main St, Anytown, USA"
   *                   city:
   *                     type: string
   *                     description: City where the employee lives
   *                     example: "San Francisco"
   *                   country:
   *                     type: string
   *                     description: Country where the employee lives
   *                     example: "USA"
   *                   notes:
   *                     type: string
   *                     description: Personal notes about the employee
   *                     example: "Excellent team player with strong communication skills"
   *               employment:
   *                 type: object
   *                 required: [position]
   *                 properties:
   *                   position:
   *                     type: string
   *                     minLength: 1
   *                     description: Job position/title
   *                     example: "Software Engineer"
   *                   hireDate:
   *                     type: string
   *                     description: Date when employee was hired (YYYY-MM-DD format)
   *                     example: "2024-01-15"
   *                   location:
   *                     type: string
   *                     description: Work location
   *                     example: "San Francisco Office"
   *                   salary:
   *                     type: number
   *                     minimum: 0
   *                     description: Annual salary
   *                     example: 95000
   *                   hourlyRate:
   *                     type: number
   *                     minimum: 0
   *                     description: Hourly rate (for hourly employees)
   *                     example: 45.50
   *                   employmentType:
   *                     type: string
   *                     description: Type of employment
   *                     example: "Full-time"
   *                   workStatus:
   *                     type: string
   *                     description: Current work assignment status
   *                     example: "Available"
   *                   employeeStatus:
   *                     type: string
   *                     description: Current employment status
   *                     example: "Active"
   *                   managerId:
   *                     type: string
   *                     description: Manager's person ID
   *                     example: "789e0123-e89b-12d3-a456-426614174002"
   *                   notes:
   *                     type: string
   *                     description: Employment-related notes
   *                     example: "Starting as Software Engineer"
   *           examples:
   *             minimal_employee:
   *               summary: Minimal required fields
   *               description: Create an employee with only the required fields
   *               value:
   *                 person:
   *                   firstName: "Jane"
   *                   lastName: "Smith"
   *                   email: "jane.smith@company.com"
   *                 employment:
   *                   position: "Software Engineer"
   *             complete_employee:
   *               summary: Complete employee profile
   *               description: Create an employee with comprehensive information
   *               value:
   *                 person:
   *                   firstName: "John"
   *                   lastName: "Doe"
   *                   email: "john.doe@company.com"
   *                   phone: "+1-555-0123"
   *                   birthDate: "1990-05-15"
   *                   address: "123 Main St, Anytown, USA"
   *                   city: "San Francisco"
   *                   country: "USA"
   *                   notes: "Excellent team player with strong communication skills"
   *                 employment:
   *                   position: "Senior Software Engineer"
   *                   hireDate: "2024-01-15"
   *                   location: "San Francisco Office"
   *                   salary: 95000
   *                   employmentType: "Full-time"
   *                   workStatus: "Available"
   *                   employeeStatus: "Active"
   *                   managerId: "789e0123-e89b-12d3-a456-426614174002"
   *                   notes: "Starting as Senior Engineer, reporting to Tech Lead"
   *             manager_employee:
   *               summary: Employee with management role
   *               description: Create an employee in a management position
   *               value:
   *                 person:
   *                   firstName: "Sarah"
   *                   lastName: "Johnson"
   *                   email: "sarah.johnson@company.com"
   *                   phone: "+1-555-0789"
   *                 employment:
   *                   position: "Engineering Manager"
   *                   hireDate: "2024-02-01"
   *                   location: "San Francisco Office"
   *                   salary: 120000
   *                   employmentType: "Full-time"
   *                   workStatus: "On Project"
   *                   employeeStatus: "Active"
   *                   notes: "Leading the frontend development team"
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
   *                   $ref: '#/components/schemas/EmployeeProfile'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Validation error - missing required fields or invalid data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [error]
   *                 message:
   *                   type: string
   *                   example: "Validation failed"
   *                 details:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       code:
   *                         type: string
   *                         example: "invalid_type"
   *                       expected:
   *                         type: string
   *                         example: "string"
   *                       received:
   *                         type: string
   *                         example: "undefined"
   *                       path:
   *                         type: array
   *                         items:
   *                           type: string
   *                         example: ["person", "firstName"]
   *                       message:
   *                         type: string
   *                         example: "Required"
   *       409:
   *         description: Conflict - email already exists
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [error]
   *                 message:
   *                   type: string
   *                   example: "Employee with this email already exists"
   *       500:
   *         description: Internal server error
   */
  employeeRouter.post('/', (req, res) => employeeController.create(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}:
   *   patch:
   *     summary: Update employee information (partial)
   *     tags: [Employees]
   *     description: |
   *       Update employee information with partial data. Only send the fields you want to change.
   *       
   *       **Request Structure:**
   *       The request body can contain one or both objects:
   *       - `person` - Personal information updates (optional)
   *       - `employment` - Employment details updates (optional)
   *       
   *       At least one of `person` or `employment` must be provided.
   *       
   *       **Personal Information Fields (person object):**
   *       - `firstName` - Employee's first name
   *       - `lastName` - Employee's last name
   *       - `fullName` - Employee's full name
   *       - `email` - Employee's email address
   *       - `phone` - Phone number
   *       - `birthDate` - Date of birth (YYYY-MM-DD format)
   *       - `address` - Home address
   *       - `city` - City of residence
   *       - `country` - Country of residence
   *       - `notes` - Personal notes
   *       
   *       **Employment Information Fields (employment object):**
   *       - `position` - Job title/position
   *       - `hireDate` - Hire date (YYYY-MM-DD format)
   *       - `location` - Work location
   *       - `salary` - Annual salary
   *       - `hourlyRate` - Hourly rate
   *       - `employmentType` - Type of employment
   *       - `workStatus` - Work status
   *       - `employeeStatus` - Employment status
   *       - `managerId` - Manager's UUID
   *       - `notes` - Employment notes
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Employee ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             minProperties: 1
   *             properties:
   *               person:
   *                 type: object
   *                 description: Personal information updates
   *                 properties:
   *                   firstName:
   *                     type: string
   *                     minLength: 1
   *                     description: First name of the employee
   *                     example: "Jane"
   *                   lastName:
   *                     type: string
   *                     minLength: 1
   *                     description: Last name of the employee
   *                     example: "Smith"
   *                   fullName:
   *                     type: string
   *                     description: Full name of the employee
   *                     example: "Jane Smith"
   *                   email:
   *                     type: string
   *                     format: email
   *                     description: Email address of the employee
   *                     example: "jane.smith@company.com"
   *                   phone:
   *                     type: string
   *                     description: Phone number of the employee
   *                     example: "+1-555-0123"
   *                   birthDate:
   *                     type: string
   *                     description: Birth date (YYYY-MM-DD format)
   *                     example: "1990-05-15"
   *                   address:
   *                     type: string
   *                     description: Home address
   *                     example: "123 Main St, Anytown, USA"
   *                   city:
   *                     type: string
   *                     description: City of residence
   *                     example: "San Francisco"
   *                   country:
   *                     type: string
   *                     description: Country of residence
   *                     example: "USA"
   *                   notes:
   *                     type: string
   *                     description: Personal notes
   *                     example: "Updated contact information"
   *               employment:
   *                 type: object
   *                 description: Employment information updates
   *                 properties:
   *                   position:
   *                     type: string
   *                     minLength: 1
   *                     description: Job position/title
   *                     example: "Senior Software Engineer"
   *                   hireDate:
   *                     type: string
   *                     description: Hire date (YYYY-MM-DD format)
   *                     example: "2024-01-15"
   *                   location:
   *                     type: string
   *                     description: Work location
   *                     example: "Remote"
   *                   salary:
   *                     type: number
   *                     minimum: 0
   *                     description: Annual salary
   *                     example: 110000
   *                   hourlyRate:
   *                     type: number
   *                     minimum: 0
   *                     description: Hourly rate
   *                     example: 50.00
   *                   employmentType:
   *                     type: string
   *                     description: Type of employment
   *                     example: "Full-time"
   *                   workStatus:
   *                     type: string
   *                     description: Work assignment status
   *                     example: "On Project"
   *                   employeeStatus:
   *                     type: string
   *                     description: Employment status
   *                     example: "Active"
   *                   managerId:
   *                     type: string
   *                     description: Manager's UUID
   *                     example: "789e0123-e89b-12d3-a456-426614174002"
   *                   notes:
   *                     type: string
   *                     description: Employment notes
   *                     example: "Promoted to senior level"
   *           examples:
   *             update_position_salary:
   *               summary: Update position and salary
   *               description: Promote employee to new position with salary increase
   *               value:
   *                 employment:
   *                   position: "Senior Software Engineer"
   *                   salary: 110000
   *             update_contact_info:
   *               summary: Update contact information
   *               description: Update personal contact details
   *               value:
   *                 person:
   *                   phone: "+1-555-9999"
   *                   address: "456 New St, Different City, USA"
   *                   city: "Los Angeles"
   *             update_work_status:
   *               summary: Update work status
   *               description: Change employee work assignment status
   *               value:
   *                 employment:
   *                   workStatus: "On Project"
   *                   notes: "Assigned to new client project"
   *             update_both:
   *               summary: Update both personal and employment info
   *               description: Update both personal and employment information
   *               value:
   *                 person:
   *                   phone: "+1-555-7777"
   *                   city: "Seattle"
   *                 employment:
   *                   position: "Tech Lead"
   *                   salary: 125000
   *                   workStatus: "On Project"
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
   *                   $ref: '#/components/schemas/EmployeeProfile'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Validation error or missing data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [error]
   *                 message:
   *                   type: string
   *                   example: "Either person or employment data must be provided"
   *                 details:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       code:
   *                         type: string
   *                         example: "invalid_type"
   *                       expected:
   *                         type: string
   *                         example: "string"
   *                       received:
   *                         type: string
   *                         example: "undefined"
   *                       path:
   *                         type: array
   *                         items:
   *                           type: string
   *                         example: ["employment", "position"]
   *                       message:
   *                         type: string
   *                         example: "Required"
   *       404:
   *         description: Employee not found
   *       500:
   *         description: Internal server error
   */
  employeeRouter.patch('/:id', (req, res) => employeeController.update(req, res));

  // Employment Domain Operations

  /**
   * @swagger
   * /api/v1/employees/{id}/promote:
   *   post:
   *     summary: Promote an employee (Employment domain operation)
   *     tags: [Employees]
   *     description: Promote an employee to a new position with optional salary increase
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               newPosition:
   *                 type: string
   *                 description: New position title
   *               newSalary:
   *                 type: number
   *                 description: New salary (optional)
   *             required:
   *               - newPosition
   *     responses:
   *       200:
   *         description: Employee promoted successfully
   *       404:
   *         description: Employee not found
   */
  employeeRouter.post('/:id/promote', (req, res) => employeeController.promoteEmployee(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/terminate:
   *   post:
   *     summary: Terminate an employee (Employment domain operation)
   *     tags: [Employees]
   *     description: Terminate an employee's employment
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               endDate:
   *                 type: string
   *                 format: date
   *                 description: Termination date (optional, defaults to today)
   *               notes:
   *                 type: string
   *                 description: Termination notes (optional)
   *     responses:
   *       200:
   *         description: Employee terminated successfully
   *       404:
   *         description: Employee not found
   */
  employeeRouter.post('/:id/terminate', (req, res) => employeeController.terminateEmployee(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/assign-manager:
   *   post:
   *     summary: Assign a manager to an employee (Employment domain operation)
   *     tags: [Employees]
   *     description: Assign a manager to an employee
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               managerId:
   *                 type: string
   *                 format: uuid
   *                 description: ID of the manager to assign
   *             required:
   *               - managerId
   *     responses:
   *       200:
   *         description: Manager assigned successfully
   *       404:
   *         description: Employee or manager not found
   */
  employeeRouter.post('/:id/assign-manager', (req, res) => employeeController.assignManager(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/remove-manager:
   *   delete:
   *     summary: Remove manager from an employee (Employment domain operation)
   *     tags: [Employees]
   *     description: Remove the currently assigned manager from an employee
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Manager removed successfully
   *       404:
   *         description: Employee not found
   */
  employeeRouter.delete('/:id/remove-manager', (req, res) => employeeController.removeManager(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}/searchable-content:
   *   get:
   *     summary: Get searchable content for RAG applications
   *     tags: [Employees]
   *     description: Get formatted searchable content combining Person and Employment data for RAG applications
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Searchable content generated successfully
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
   *                     searchableContent:
   *                       type: string
   *                       description: Formatted searchable content
   *                     lastUpdated:
   *                       type: string
   *                       format: date-time
   *       404:
   *         description: Employee not found
   */
  employeeRouter.get('/:id/searchable-content', (req, res) => employeeController.getSearchableContent(req, res));

  /**
   * @swagger
   * /api/v1/employees/{id}:
   *   delete:
   *     summary: Delete an employee (terminates employment)
   *     tags: [Employees]
   *     description: Delete an employee by terminating their employment (maintains data integrity)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Employee terminated successfully
   *       404:
   *         description: Employee not found
   */
  employeeRouter.delete('/:id', (req, res) => employeeController.delete(req, res));
} catch (error) {
  console.error('Error getting EmployeeController from container:', error);
  throw error;
}

export default employeeRouter; 