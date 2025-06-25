import { Router } from 'express';
import { container } from '../../container';
import { PersonController } from '../controllers/person.controller';
import { TYPES } from '../../../shared/types';

/**
 * @swagger
 * tags:
 *   name: Persons
 *   description: Person domain management (skills, technologies, education)
 */
const personRouter = Router();

let personController: PersonController;
try {
  personController = container.get<PersonController>(TYPES.PersonController);

  /**
   * @swagger
   * /api/v1/persons:
   *   get:
   *     summary: Retrieve a paginated list of persons with filtering, searching, and sorting
   *     tags: [Persons]
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
   *         name: includeRelated
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include related data (skills, technologies, education) in response
   *     responses:
   *       200:
   *         description: A paginated list of persons with metadata
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
   *                     $ref: '#/components/schemas/Person'
   *                 pagination:
   *                   $ref: '#/components/schemas/PaginationMeta'
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
   *                       example: "/api/v1/persons"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.get('/', (req, res) => personController.getAll(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}:
   *   get:
   *     summary: Retrieve a single person by ID
   *     tags: [Persons]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *       - in: query
   *         name: includeRelated
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include related data (skills, technologies, education) in response
   *     responses:
   *       200:
   *         description: A single person with metadata
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
   *                   $ref: '#/components/schemas/Person'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *                       example: "2024-01-16T15:30:00Z"
   *       404:
   *         description: Person not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.get('/:id', (req, res) => personController.getById(req, res));

  /**
   * @swagger
   * /api/v1/persons:
   *   post:
   *     summary: Create a new person
   *     tags: [Persons]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePerson'
   *           examples:
   *             create_person:
   *               summary: Create new person example
   *               value:
   *                 firstName: "Jane"
   *                 lastName: "Smith"
   *                 email: "jane.smith@example.com"
   *                 phone: "+1-555-0123"
   *                 birthDate: "1990-05-15"
   *                 address: "123 Main St"
   *                 city: "San Francisco"
   *                 country: "USA"
   *                 notes: "Software engineer with expertise in full-stack development"
   *     responses:
   *       201:
   *         description: Person created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   $ref: '#/components/schemas/Person'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.post('/', (req, res) => personController.create(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}:
   *   patch:
   *     summary: Partially update an existing person
   *     description: Update specific fields of a person. Only send the fields you want to change.
   *     tags: [Persons]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdatePerson'
   *           examples:
   *             update_contact_info:
   *               summary: Update contact information only
   *               value:
   *                 phone: "+1-555-9876"
   *                 address: "456 New Street"
   *                 city: "Boston"
   *             update_personal_info:
   *               summary: Update personal information
   *               value:
   *                 firstName: "Janet"
   *                 notes: "Updated expertise in cloud technologies"
   *     responses:
   *       200:
   *         description: Person updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [success]
   *                 data:
   *                   $ref: '#/components/schemas/Person'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.patch('/:id', (req, res) => personController.update(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}:
   *   delete:
   *     summary: Delete a person
   *     tags: [Persons]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *     responses:
   *       204:
   *         description: Person deleted successfully
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.delete('/:id', (req, res) => personController.delete(req, res));

  // ===== SEARCH ENDPOINTS =====

  /**
   * @swagger
   * /api/v1/persons/search/skills:
   *   post:
   *     summary: Search persons by skills
   *     tags: [Person Search]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               skills:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: List of skill names to search for
   *                 example: ["JavaScript", "React", "Node.js"]
   *             required:
   *               - skills
   *     responses:
   *       200:
   *         description: List of persons matching the skills criteria
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.post('/search/skills', (req, res) => personController.searchBySkills(req, res));

  /**
   * @swagger
   * /api/v1/persons/search/technologies:
   *   post:
   *     summary: Search persons by technologies
   *     tags: [Person Search]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               technologies:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: List of technology names to search for
   *                 example: ["React", "PostgreSQL", "Docker"]
   *             required:
   *               - technologies
   *     responses:
   *       200:
   *         description: List of persons matching the technologies criteria
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.post('/search/technologies', (req, res) => personController.searchByTechnologies(req, res));

  /**
   * @swagger
   * /api/v1/persons/search/education:
   *   post:
   *     summary: Search persons by education
   *     tags: [Person Search]
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
   *     responses:
   *       200:
   *         description: List of persons matching the education criteria
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.post('/search/education', (req, res) => personController.searchByEducation(req, res));

  // ===== SKILLS MANAGEMENT ENDPOINTS =====

  /**
   * @swagger
   * /api/v1/persons/{id}/skills:
   *   post:
   *     summary: Add a skill to a person (auto-creates skill if not exists)
   *     tags: [Person Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePersonSkill'
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
  personRouter.post('/:id/skills', (req, res) => personController.addSkill(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/skills/{skillId}:
   *   patch:
   *     summary: Update a person's skill
   *     tags: [Person Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *       - in: path
   *         name: skillId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The skill ID or skill name
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdatePersonSkill'
   *     responses:
   *       200:
   *         description: Skill updated successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.patch('/:id/skills/:skillId', (req, res) => personController.updateSkill(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/skills/{skillId}:
   *   delete:
   *     summary: Remove a skill from a person
   *     tags: [Person Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *       - in: path
   *         name: skillId
   *         required: true
   *         schema:
   *           type: string
   *         description: The skill ID or skill name
   *     responses:
   *       204:
   *         description: Skill removed successfully
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.delete('/:id/skills/:skillId', (req, res) => personController.removeSkill(req, res));

  // ===== TECHNOLOGIES MANAGEMENT ENDPOINTS =====

  /**
   * @swagger
   * /api/v1/persons/{id}/technologies:
   *   post:
   *     summary: Add a technology to a person (auto-creates technology if not exists)
   *     tags: [Person Technologies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePersonTechnology'
   *           examples:
   *             react_technology:
   *               summary: Add React technology
   *               value:
   *                 technologyName: "React"
   *                 proficiencyLevel: "Expert"
   *                 yearsOfExperience: "4"
   *                 lastUsed: "2024-01-10T00:00:00Z"
   *                 context: "Frontend Development"
   *                 projectName: "E-commerce Platform"
   *                 description: "Used for building responsive user interfaces"
   *     responses:
   *       201:
   *         description: Technology added successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.post('/:id/technologies', (req, res) => personController.addTechnology(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/technologies/{technologyId}:
   *   patch:
   *     summary: Update a person's technology
   *     tags: [Person Technologies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *       - in: path
   *         name: technologyId
   *         required: true
   *         schema:
   *           type: string
   *         description: The technology ID or technology name
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdatePersonTechnology'
   *     responses:
   *       200:
   *         description: Technology updated successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.patch('/:id/technologies/:technologyId', (req, res) => personController.updateTechnology(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/technologies/{technologyId}:
   *   delete:
   *     summary: Remove a technology from a person
   *     tags: [Person Technologies]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *       - in: path
   *         name: technologyId
   *         required: true
   *         schema:
   *           type: string
   *         description: The technology ID or technology name
   *     responses:
   *       204:
   *         description: Technology removed successfully
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.delete('/:id/technologies/:technologyId', (req, res) => personController.removeTechnology(req, res));

  // ===== EDUCATION MANAGEMENT ENDPOINTS =====

  /**
   * @swagger
   * /api/v1/persons/{id}/education:
   *   post:
   *     summary: Add education to a person
   *     tags: [Person Education]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePersonEducation'
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
   *     responses:
   *       201:
   *         description: Education added successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.post('/:id/education', (req, res) => personController.addEducation(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/education/{educationId}:
   *   patch:
   *     summary: Update education record
   *     tags: [Person Education]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *       - in: path
   *         name: educationId
   *         required: true
   *         schema:
   *           type: string
   *         description: The education record ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdatePersonEducation'
   *     responses:
   *       200:
   *         description: Education updated successfully
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.patch('/:id/education/:educationId', (req, res) => personController.updateEducation(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/education/{educationId}:
   *   delete:
   *     summary: Remove education record from a person
   *     tags: [Person Education]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *       - in: path
   *         name: educationId
   *         required: true
   *         schema:
   *           type: string
   *         description: The education record ID
   *     responses:
   *       204:
   *         description: Education removed successfully
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.delete('/:id/education/:educationId', (req, res) => personController.removeEducation(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/capabilities:
   *   get:
   *     summary: Get person's capabilities summary
   *     tags: [Person Search]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *     responses:
   *       200:
   *         description: Person's capabilities summary
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
   *                     personId:
   *                       type: string
   *                       format: uuid
   *                       description: Person ID
   *                     capabilities:
   *                       type: object
   *                       description: Comprehensive capabilities summary
   *                 meta:
   *                   type: object
   *                   properties:
   *                     timestamp:
   *                       type: string
   *                       format: date-time
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.get('/:id/capabilities', (req, res) => personController.getCapabilities(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/analyze-ai:
   *   post:
   *     summary: Analyze person capabilities using AI
   *     tags: [Person AI]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               analysisType:
   *                 type: string
   *                 description: Type of analysis to perform
   *                 example: "capability_analysis"
   *                 default: "capability_analysis"
   *     responses:
   *       200:
   *         description: AI analysis result
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
   *                     analysis:
   *                       type: string
   *                       description: AI-generated analysis text
   *                     personId:
   *                       type: string
   *                       format: uuid
   *                     analysisType:
   *                       type: string
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.post('/:id/analyze-ai', (req, res) => personController.analyzeWithAI(req, res));

  /**
   * @swagger
   * /api/v1/persons/{id}/generate-report:
   *   post:
   *     summary: Generate AI-powered report for person
   *     tags: [Person AI]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: The person ID
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reportType:
   *                 type: string
   *                 description: Type of report to generate
   *                 example: "comprehensive"
   *                 default: "comprehensive"
   *     responses:
   *       200:
   *         description: AI-generated report
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
   *                     report:
   *                       type: string
   *                       description: AI-generated report text
   *                     personId:
   *                       type: string
   *                       format: uuid
   *                     reportType:
   *                       type: string
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  personRouter.post('/:id/generate-report', (req, res) => personController.generateReport(req, res));

} catch (error) {
  console.error('Failed to initialize PersonController:', error);
}

export default personRouter; 