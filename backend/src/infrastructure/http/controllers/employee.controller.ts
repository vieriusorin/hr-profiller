import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../shared/types';
import { EmployeeApplicationService } from '../../../domain/employee/services/employee-application.service';
import { EmploymentService } from '../../../domain/employee/services/employment.service';
import { EmployeePresenter } from '../../../interfaces/presenters/employee.presenter';
import { QueryParser } from '../../../shared/utils/query-parser';
import { TypeNewPerson } from '../../../../db/schema/people.schema';
import { CreateEmploymentData } from '../../../domain/employee/repositories/employment.repository';
import { z } from 'zod';

// Validation schemas focused on Employment domain
const CreatePersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  fullName: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

const CreateEmploymentSchema = z.object({
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  salary: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  employmentType: z.string().optional(),
  hireDate: z.string().optional(),
  workStatus: z.string().optional(),
  employeeStatus: z.string().optional(),
  managerId: z.string().optional(),
  notes: z.string().optional(),
});

const CreateEmployeeSchema = z.object({
  person: CreatePersonSchema,
  employment: CreateEmploymentSchema,
});

const UpdatePersonSchema = CreatePersonSchema.partial();
const UpdateEmploymentSchema = CreateEmploymentSchema.partial();

const PromoteEmployeeSchema = z.object({
  newPosition: z.string().min(1, 'New position is required'),
  newSalary: z.number().positive().optional(),
});

const TerminateEmployeeSchema = z.object({
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

const AssignManagerSchema = z.object({
  managerId: z.string().min(1, 'Manager ID is required'),
});

// Types for the request bodies
type CreateEmployeeRequestData = z.infer<typeof CreateEmployeeSchema>;
type PromoteEmployeeRequestData = z.infer<typeof PromoteEmployeeSchema>;
type TerminateEmployeeRequestData = z.infer<typeof TerminateEmployeeSchema>;
type AssignManagerRequestData = z.infer<typeof AssignManagerSchema>;

@injectable()
export class EmployeeController {
  private readonly presenter = new EmployeePresenter();

  constructor(
    @inject(TYPES.EmployeeApplicationService)
    private readonly employeeApplicationService: EmployeeApplicationService,
    @inject(TYPES.EmploymentService)
    private readonly employmentService: EmploymentService
  ) { }

  /**
   * Get all employees with their employment details
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const employeeProfiles = await this.employeeApplicationService.getAllEmployeeProfiles();
      console.log(`Found ${employeeProfiles.length} active employees`);

      // Parse query parameters
      const queryParams = QueryParser.parseAll(req);

      // Process the collection using the presenter's internal methods
      const { processedData, totalFiltered, totalOriginal } = (this.presenter as any).processCollection(employeeProfiles, queryParams);
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

  /**
   * Get employee by ID with employment details
   */
  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeProfile = await this.employeeApplicationService.getEmployeeProfile(id);

      if (!employeeProfile) {
        const errorResponse = this.presenter.error({ message: 'Employee not found', code: 'NOT_FOUND' });
        res.status(404).json(errorResponse);
        return;
      }

      const response = this.presenter.success(employeeProfile);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Create a new employee (Person + Employment)
   */
  async create(req: Request<unknown, unknown, CreateEmployeeRequestData>, res: Response): Promise<void> {
    try {
      const employeeValidation = CreateEmployeeSchema.safeParse(req.body);
      if (!employeeValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Validation failed',
          details: employeeValidation.error.errors
        });
        res.status(400).json(errorResponse);
        return;
      }

      const { person, employment } = employeeValidation.data;

      // Prepare person data with proper types
      const personData: TypeNewPerson = {
        firstName: person.firstName,
        lastName: person.lastName,
        fullName: person.fullName || `${person.firstName} ${person.lastName}`,
        email: person.email,
        phone: person.phone || null,
        birthDate: person.birthDate || null,
        address: person.address || null,
        city: person.city || null,
        country: person.country || null,
        notes: person.notes || null,
      };

      // Prepare employment data
      const employmentData: Omit<CreateEmploymentData, 'personId'> = {
        position: employment.position,
        location: employment.location || undefined,
        salary: employment.salary || undefined,
        hourlyRate: employment.hourlyRate || undefined,
        employmentType: employment.employmentType || undefined,
        hireDate: employment.hireDate ? new Date(employment.hireDate) : undefined,
        workStatus: employment.workStatus || undefined,
        employeeStatus: employment.employeeStatus || undefined,
        managerId: employment.managerId || undefined,
        notes: employment.notes || undefined,
      };

      const newEmployee = await this.employeeApplicationService.createEmployee(personData, employmentData);
      const response = this.presenter.success(newEmployee);
      res.status(201).json(response);
    } catch (error: any) {
      console.error('Error creating employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Update employee information (Person and/or Employment)
   */
  async update(req: Request<{ id: string }, unknown, { person?: any; employment?: any }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { person, employment } = req.body;

      if (!person && !employment) {
        const errorResponse = this.presenter.error({ message: 'Either person or employment data must be provided' });
        res.status(400).json(errorResponse);
        return;
      }

      // Validate person data if provided
      if (person) {
        const personValidation = UpdatePersonSchema.safeParse(person);
        if (!personValidation.success) {
          const errorResponse = this.presenter.error({
            message: 'Person validation failed',
            details: personValidation.error.errors
          });
          res.status(400).json(errorResponse);
          return;
        }
      }

      // Validate employment data if provided
      if (employment) {
        const employmentValidation = UpdateEmploymentSchema.safeParse(employment);
        if (!employmentValidation.success) {
          const errorResponse = this.presenter.error({
            message: 'Employment validation failed',
            details: employmentValidation.error.errors
          });
          res.status(400).json(errorResponse);
          return;
        }
      }

      const updatedEmployee = await this.employeeApplicationService.updateEmployeeProfile(id, person, employment);
      const response = this.presenter.success(updatedEmployee);
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Promote an employee (Employment domain operation)
   */
  async promoteEmployee(req: Request<{ id: string }, unknown, PromoteEmployeeRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotionValidation = PromoteEmployeeSchema.safeParse(req.body);

      if (!promotionValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Validation failed',
          details: promotionValidation.error.errors
        });
        res.status(400).json(errorResponse);
        return;
      }

      const { newPosition, newSalary } = promotionValidation.data;
      await this.employeeApplicationService.promoteEmployee(id, newPosition, newSalary);

      res.status(200).json({
        status: 'success',
        data: { message: 'Employee promoted successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error promoting employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Terminate an employee (Employment domain operation)
   */
  async terminateEmployee(req: Request<{ id: string }, unknown, TerminateEmployeeRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const terminationValidation = TerminateEmployeeSchema.safeParse(req.body);

      if (!terminationValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Validation failed',
          details: terminationValidation.error.errors
        });
        res.status(400).json(errorResponse);
        return;
      }

      const { endDate, notes } = terminationValidation.data;
      const terminationDate = endDate ? new Date(endDate) : undefined;
      await this.employeeApplicationService.terminateEmployee(id, terminationDate, notes);

      res.status(200).json({
        status: 'success',
        data: { message: 'Employee terminated successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error terminating employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Assign a manager to an employee (Employment domain operation)
   */
  async assignManager(req: Request<{ id: string }, unknown, AssignManagerRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const managerValidation = AssignManagerSchema.safeParse(req.body);

      if (!managerValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Validation failed',
          details: managerValidation.error.errors
        });
        res.status(400).json(errorResponse);
        return;
      }

      const { managerId } = managerValidation.data;
      await this.employeeApplicationService.assignManager(id, managerId);

      res.status(200).json({
        status: 'success',
        data: { message: 'Manager assigned successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error assigning manager:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Remove manager from an employee (Employment domain operation)
   */
  async removeManager(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Use the EmployeeApplicationService for manager removal
      await this.employeeApplicationService.removeManager(id);

      res.status(200).json({
        status: 'success',
        data: { message: 'Manager removed successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error removing manager:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Get employment analytics and statistics
   * Note: Analytics functionality to be implemented in future iterations
   */
  // async getEmploymentAnalytics(req: Request, res: Response): Promise<void> {
  //   // TODO: Implement employment analytics when EmploymentService supports it
  // }

  /**
   * Delete an employee (both Person and Employment)
   */
  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // For DDD architecture, we should terminate employment rather than delete
      // This maintains data integrity and audit trail
      await this.employeeApplicationService.terminateEmployee(id, new Date(), 'Employee record deleted');

      res.status(200).json({
        status: 'success',
        data: { message: 'Employee terminated successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Get searchable content for RAG (includes both Person and Employment data)
   */
  async getSearchableContent(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employeeProfile = await this.employeeApplicationService.getEmployeeProfile(id);

      if (!employeeProfile) {
        const errorResponse = this.presenter.error({ message: 'Employee not found', code: 'NOT_FOUND' });
        res.status(404).json(errorResponse);
        return;
      }

      const searchableContent = this.generateSearchableContent(employeeProfile);

      res.status(200).json({
        status: 'success',
        data: {
          employeeId: id,
          searchableContent,
          lastUpdated: new Date().toISOString()
        },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error: any) {
      console.error('Error getting searchable content:', error);
      const errorResponse = this.presenter.error(error);
      res.status(500).json(errorResponse);
    }
  }

  private generateSearchableContent(profile: any): string {
    const parts = [];

    // Person information
    if (profile.person) {
      parts.push(`Name: ${profile.person.fullName || `${profile.person.firstName} ${profile.person.lastName}`}`);
      if (profile.person.email) parts.push(`Email: ${profile.person.email}`);
      if (profile.person.phone) parts.push(`Phone: ${profile.person.phone}`);
      if (profile.person.city) parts.push(`Location: ${profile.person.city}`);
    }

    // Employment information
    if (profile.employment) {
      parts.push(`Position: ${profile.employment.position}`);
      if (profile.employment.location) parts.push(`Work Location: ${profile.employment.location}`);
      if (profile.employment.employeeStatus) parts.push(`Status: ${profile.employment.employeeStatus}`);
      if (profile.employment.workStatus) parts.push(`Work Status: ${profile.employment.workStatus}`);
      if (profile.employment.employmentType) parts.push(`Employment Type: ${profile.employment.employmentType}`);
    }

    // Skills (from Person domain)
    if (profile.skills && profile.skills.length > 0) {
      const skillsText = profile.skills.map((skill: any) =>
        `${skill.skillName} (${skill.proficiencyLevel || 'Unknown'} level${skill.yearsOfExperience ? `, ${skill.yearsOfExperience} years` : ''})`
      ).join(', ');
      parts.push(`Skills: ${skillsText}`);
    }

    // Technologies (from Person domain)
    if (profile.technologies && profile.technologies.length > 0) {
      const techText = profile.technologies.map((tech: any) =>
        `${tech.technologyName}${tech.yearsOfExperience ? ` (${tech.yearsOfExperience} years)` : ''}`
      ).join(', ');
      parts.push(`Technologies: ${techText}`);
    }

    // Education (from Person domain)
    if (profile.education && profile.education.length > 0) {
      const eduText = profile.education.map((edu: any) =>
        `${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Field'} from ${edu.institution}`
      ).join(', ');
      parts.push(`Education: ${eduText}`);
    }

    return parts.join(' | ');
  }
} 