import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../shared/types';
import { EmployeeService } from '../../../domain/employee/services/employee.service';
import { EmployeePresenter } from '../../../interfaces/presenters/employee.presenter';
import { QueryParser } from '../../../shared/utils/query-parser';
import { CreateEmployeeSchema, UpdateEmployeeSchema, TypeNewEmployee, TypeUpdateEmployee } from '../../../../db/schema/employee.schema';
import { z } from 'zod';




// New Validation schemas for enhanced functionality
const CreateEmployeeSkillRequestSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required'),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  yearsOfExperience: z.string().optional(),
  lastUsed: z.string().optional(), // ISO date string
  isCertified: z.boolean().optional(),
  certificationName: z.string().optional(),
  certificationDate: z.string().optional(), // ISO date string
  notes: z.string().optional(),
});

const CreateEmployeeTechnologyRequestSchema = z.object({
  technologyName: z.string().min(1, 'Technology name is required'),
  proficiencyLevel: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  lastUsed: z.string().optional(), // ISO date string
  context: z.string().optional(),
  projectName: z.string().optional(),
  description: z.string().optional(),
});

const CreateEmployeeEducationRequestSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(), // ISO date string
  graduationDate: z.string().optional(), // ISO date string
  description: z.string().optional(),
  gpa: z.string().optional(),
  isCurrentlyEnrolled: z.string().optional(),
});

const SearchSkillsSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

const SearchTechnologiesSchema = z.object({
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
});

const SearchEducationSchema = z.object({
  institution: z.string().optional(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
}).refine(data => Object.values(data).some(val => val), {
  message: 'At least one search criteria is required',
});

// Types for the request bodies
type CreateEmployeeSkillRequestData = z.infer<typeof CreateEmployeeSkillRequestSchema>;
type CreateEmployeeTechnologyRequestData = z.infer<typeof CreateEmployeeTechnologyRequestSchema>;
type CreateEmployeeEducationRequestData = z.infer<typeof CreateEmployeeEducationRequestSchema>;

@injectable()
export class EmployeeController {
  private readonly presenter = new EmployeePresenter();

  constructor(
    @inject(TYPES.EmployeeService)
    private readonly employeeService: EmployeeService
  ) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Default to true, but allow explicit false
      const includeRelated = req.query.includeRelated !== 'false';
      const employees = await this.employeeService.getAllEmployees(includeRelated);
      console.log(`Found ${employees.length} employees`);

      // Parse query parameters
      const queryParams = QueryParser.parseAll(req);

      // Process the collection using the presenter's internal methods
      const { processedData, totalFiltered, totalOriginal } = (this.presenter as any).processCollection(employees, queryParams);
      const presentedData = this.presenter.presentCollection(processedData);

      // Create pagination metadata
      const { page = 1, limit = 10 } = queryParams;
      const totalPages = Math.ceil(totalFiltered / limit);
      const pagination = {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
      };

      // Create the response with flatter structure
      const response = {
        status: 'success' as const,
        data: presentedData,
        pagination,
        filters: queryParams.filters,
        search: queryParams.search ? { search: queryParams.search, searchFields: queryParams.searchFields } : undefined,
        sort: queryParams.sortBy ? { sortBy: queryParams.sortBy, sortOrder: queryParams.sortOrder } : undefined,
        meta: {
          count: presentedData.length,
          filtered: totalFiltered,
          total: totalOriginal,
          timestamp: new Date().toISOString(),
          endpoint: req.originalUrl,
        }
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error in EmployeeController.getAll:', error);
      console.error('Stack trace:', error.stack);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Default to true, but allow explicit false
      const includeRelated = req.query.includeRelated !== 'false';
      const employee = await this.employeeService.getEmployeeById(id, includeRelated);

      if (!employee) {
        const errorResponse = this.presenter.error({ message: 'Employee not found', code: 'NOT_FOUND' });
        res.status(404).json(errorResponse);
        return;
      }

      const response = this.presenter.success(employee);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async create(req: Request<{}, {}, TypeNewEmployee>, res: Response): Promise<void> {
    try {
      const employeeValidation = CreateEmployeeSchema.safeParse(req.body);
      
      if (!employeeValidation.success) {
        const errorResponse = this.presenter.error({ 
          message: 'Invalid request body', 
          code: 'VALIDATION_ERROR',
          details: employeeValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }
      
      const employeeData = employeeValidation.data;

      const employee = await this.employeeService.createEmployee(employeeData);
      const response = this.presenter.success(employee);
      res.status(201).json(response);
    } catch (error: any) {
      console.error('Error creating employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async update(req: Request<{ id: string }, {}, TypeUpdateEmployee>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeValidation = UpdateEmployeeSchema.safeParse(req.body);

      if (!employeeValidation.success) {
        const errorResponse = this.presenter.error({ 
          message: 'Invalid request body', 
          code: 'VALIDATION_ERROR',
          details: employeeValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const employee = await this.employeeService.updateEmployee(id, employeeValidation.data);
      const response = this.presenter.success(employee);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.employeeService.deleteEmployee(id);

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  // Skills management endpoints
  async addSkill(req: Request<{ id: string }, {}, CreateEmployeeSkillRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const skillValidation = CreateEmployeeSkillRequestSchema.safeParse(req.body);

      console.log('skillValidation', skillValidation.error);

      if (!skillValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid skill data',
          code: 'VALIDATION_ERROR',
          details: skillValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const skillData = {
        ...skillValidation.data,
        yearsOfExperience: skillValidation.data.yearsOfExperience ? parseInt(skillValidation.data.yearsOfExperience) : undefined,
        lastUsed: skillValidation.data.lastUsed ? new Date(skillValidation.data.lastUsed) : undefined,
        certificationDate: skillValidation.data.certificationDate ? new Date(skillValidation.data.certificationDate) : undefined
      };

      await this.employeeService.addSkillToEmployee(id, skillData);
      res.status(201).json({
        status: 'success',
        data: { message: 'Skill added successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error adding skill to employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async updateSkill(req: Request<{ id: string; skillId: string }, {}, Partial<CreateEmployeeSkillRequestData>>, res: Response): Promise<void> {
    try {
      const { id, skillId } = req.params;
      const skillValidation = CreateEmployeeSkillRequestSchema.partial().safeParse(req.body);

      if (!skillValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid skill data',
          code: 'VALIDATION_ERROR',
          details: skillValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const skillData = {
        ...skillValidation.data,
        yearsOfExperience: skillValidation.data.yearsOfExperience ? parseInt(skillValidation.data.yearsOfExperience) : undefined,
        lastUsed: skillValidation.data.lastUsed ? new Date(skillValidation.data.lastUsed) : undefined,
        certificationDate: skillValidation.data.certificationDate ? new Date(skillValidation.data.certificationDate) : undefined
      };

      console.log('skillData', skillData);

      await this.employeeService.updateEmployeeSkill(id, skillId, skillData);
      res.status(200).json({
        status: 'success',
        data: { message: 'Skill updated successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error updating employee skill:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async removeSkill(req: Request<{ id: string; skillId: string }>, res: Response): Promise<void> {
    try {
      const { id, skillId } = req.params;
      await this.employeeService.removeSkillFromEmployee(id, skillId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing skill from employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  // Technology management endpoints
  async addTechnology(req: Request<{ id: string }, {}, CreateEmployeeTechnologyRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const technologyValidation = CreateEmployeeTechnologyRequestSchema.safeParse(req.body);

      console.log('technologyValidation', technologyValidation.error);

      if (!technologyValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid technology data',
          code: 'VALIDATION_ERROR',
          details: technologyValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const technologyData = {
        ...technologyValidation.data,
        lastUsed: technologyValidation.data.lastUsed ? new Date(technologyValidation.data.lastUsed) : undefined,
      };

      await this.employeeService.addTechnologyToEmployee(id, technologyData);
      res.status(201).json({
        status: 'success',
        data: { message: 'Technology added successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error adding technology to employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async updateTechnology(req: Request<{ id: string; technologyId: string }, {}, Partial<CreateEmployeeTechnologyRequestData>>, res: Response): Promise<void> {
    try {
      const { id, technologyId } = req.params;
      const technologyValidation = CreateEmployeeTechnologyRequestSchema.partial().safeParse(req.body);

      if (!technologyValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid technology data',
          code: 'VALIDATION_ERROR',
          details: technologyValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const technologyData = {
        ...technologyValidation.data,
        lastUsed: technologyValidation.data.lastUsed ? new Date(technologyValidation.data.lastUsed) : undefined,
      };

      await this.employeeService.updateEmployeeTechnology(id, technologyId, technologyData);
      res.status(200).json({
        status: 'success',
        data: { message: 'Technology updated successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error updating employee technology:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async removeTechnology(req: Request<{ id: string; technologyId: string }>, res: Response): Promise<void> {
    try {
      const { id, technologyId } = req.params;
      await this.employeeService.removeTechnologyFromEmployee(id, technologyId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing technology from employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  // Education management endpoints
  async addEducation(req: Request<{ id: string }, {}, CreateEmployeeEducationRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const educationValidation = CreateEmployeeEducationRequestSchema.safeParse(req.body);

      if (!educationValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid education data',
          code: 'VALIDATION_ERROR',
          details: educationValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const educationData = {
        ...educationValidation.data,
        startDate: educationValidation.data.startDate ? new Date(educationValidation.data.startDate) : undefined,
        graduationDate: educationValidation.data.graduationDate ? new Date(educationValidation.data.graduationDate) : undefined,
      };

      const educationId = await this.employeeService.addEducationToEmployee(id, educationData);
      res.status(201).json({
        status: 'success',
        data: { message: 'Education added successfully', educationId },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error adding education to employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async updateEducation(req: Request<{ educationId: string }, {}, Partial<CreateEmployeeEducationRequestData>>, res: Response): Promise<void> {
    try {
      const { educationId } = req.params;
      const educationValidation = CreateEmployeeEducationRequestSchema.partial().safeParse(req.body);

      if (!educationValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid education data',
          code: 'VALIDATION_ERROR',
          details: educationValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const educationData = {
        ...educationValidation.data,
        startDate: educationValidation.data.startDate ? new Date(educationValidation.data.startDate) : undefined,
        graduationDate: educationValidation.data.graduationDate ? new Date(educationValidation.data.graduationDate) : undefined,
      };

      await this.employeeService.updateEmployeeEducation(educationId, educationData);
      res.status(200).json({
        status: 'success',
        data: { message: 'Education updated successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error updating employee education:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  async removeEducation(req: Request<{ educationId: string }>, res: Response): Promise<void> {
    try {
      const { educationId } = req.params;
      await this.employeeService.removeEducationFromEmployee(educationId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing education from employee:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      const errorResponse = this.presenter.error(error);
      res.status(statusCode).json(errorResponse);
    }
  }

  // Search endpoints for RAG functionality
  async searchBySkills(req: Request<{}, {}, { skills: string[] }>, res: Response): Promise<void> {
    try {
      const searchValidation = SearchSkillsSchema.safeParse(req.body);

      if (!searchValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid search criteria',
          code: 'VALIDATION_ERROR',
          details: searchValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const employees = await this.employeeService.searchEmployeesBySkills(searchValidation.data.skills);
      const response = this.presenter.successCollection(employees, req);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error searching employees by skills:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async searchByTechnologies(req: Request<{}, {}, { technologies: string[] }>, res: Response): Promise<void> {
    try {
      const searchValidation = SearchTechnologiesSchema.safeParse(req.body);

      if (!searchValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid search criteria',
          code: 'VALIDATION_ERROR',
          details: searchValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const employees = await this.employeeService.searchEmployeesByTechnologies(searchValidation.data.technologies);
      const response = this.presenter.successCollection(employees, req);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error searching employees by technologies:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  async searchByEducation(req: Request<{}, {}, { institution?: string; degree?: string; fieldOfStudy?: string }>, res: Response): Promise<void> {
    try {
      const searchValidation = SearchEducationSchema.safeParse(req.body);

      if (!searchValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Invalid search criteria',
          code: 'VALIDATION_ERROR',
          details: searchValidation.error.format()
        });
        res.status(400).json(errorResponse);
        return;
      }

      const { institution, degree, fieldOfStudy } = searchValidation.data;
      const employees = await this.employeeService.searchEmployeesByEducation(institution, degree, fieldOfStudy);
      const response = this.presenter.successCollection(employees, req);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error searching employees by education:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  // RAG content endpoint
  async getSearchableContent(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await this.employeeService.getEmployeeById(id, true);

      if (!employee) {
        const errorResponse = this.presenter.error({ message: 'Employee not found', code: 'NOT_FOUND' });
        res.status(404).json(errorResponse);
        return;
      }

      const searchableContent = employee.getSearchableContent();
      res.status(200).json({
        status: 'success',
        data: {
          employeeId: id,
          searchableContent,
          skillsCount: employee.skills.length,
          technologiesCount: employee.technologies.length,
          educationCount: employee.education.length
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error getting searchable content:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }
} 