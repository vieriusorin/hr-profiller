import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../shared/types';
import { EmployeeApplicationService } from '../../../domain/employee/services/employee-application.service';
import { EmploymentService } from '../../../domain/employee/services/employment.service';
import { EmployeePresenter } from '../../../interfaces/presenters/employee.presenter';
import { TypeNewPerson } from '../../../../db/schema/people.schema';
import { CreateEmploymentData } from '../../../domain/employee/repositories/employment.repository';
import { z } from 'zod';

/**
 * @schema CreateEmployeeSchema
 * @description Schema for creating a new employee, including person and employment details.
 */
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

/**
 * @schema CreateEmploymentSchema
 * @description Schema for creating employment details for a new employee.
 * Includes position, location, salary, hire date, and other relevant fields.
 * All fields are optional except position.
 */
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

/**
 * @schema CreateEmployeeSchema
 * @description Schema for creating a new employee, combining person and employment schemas.
 * Includes all necessary fields for both person and employment details.
 * @property person - Person details schema.
 * @property employment - Employment details schema.
 */
const CreateEmployeeSchema = z.object({
  person: CreatePersonSchema,
  employment: CreateEmploymentSchema,
});

/**
 * @schema UpdatePersonSchema
 * @description Schema for updating person details.
 * All fields are optional to allow partial updates.
 */
const UpdatePersonSchema = CreatePersonSchema.partial();

/**
 * @schema UpdateEmploymentSchema
 * @description Schema for updating employment details.
 * All fields are optional to allow partial updates.
 */
const UpdateEmploymentSchema = CreateEmploymentSchema.partial();

/**
 * @schema PromoteEmployeeSchema
 * @description Schema for promoting an employee.
 * Includes new position and optional new salary.
 * @property newPosition - The new job position for the employee.
 * @property newSalary - The new salary amount for the employee (optional).
 */
const PromoteEmployeeSchema = z.object({
  newPosition: z.string().min(1, 'New position is required'),
  newSalary: z.number().positive().optional(),
});

/**
 * @schema TerminateEmployeeSchema
 * @description Schema for terminating an employee.
 * Includes optional end date and notes.
 * @property endDate - The termination date (optional).
 * @property notes - Additional notes regarding the termination (optional).
 */
const TerminateEmployeeSchema = z.object({
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * @schema AssignManagerSchema
 * @description Schema for assigning a manager to an employee.
 * Includes the manager ID.
 * @property managerId - The ID of the manager to assign.
 */
const AssignManagerSchema = z.object({
  managerId: z.string().min(1, 'Manager ID is required'),
});

// Types for the request bodies
type CreateEmployeeRequestData = z.infer<typeof CreateEmployeeSchema>;
type PromoteEmployeeRequestData = z.infer<typeof PromoteEmployeeSchema>;
type TerminateEmployeeRequestData = z.infer<typeof TerminateEmployeeSchema>;
type AssignManagerRequestData = z.infer<typeof AssignManagerSchema>;

/**
 * @description Controller for managing employee-related HTTP requests.
 * Handles operations such as creating, updating, promoting, and terminating employees.
 * Utilizes EmployeeApplicationService for business logic and EmployeePresenter for response formatting.
 * @class EmployeeController
 * @property employeeApplicationService - Service for employee application logic.
 * @property employmentService - Service for employment-specific operations.
 * @property presenter - Presenter for formatting employee responses.
 * @method getAll - Get all employees with their employment details.
 * @method getById - Get employee by ID with employment details.
 * @method create - Create a new employee (Person + Employment).
 * @method update - Update employee information (Person and/or Employment).
 * @method promoteEmployee - Promote an employee (Employment domain operation).
 * @method terminateEmployee - Terminate an employee (Employment domain operation).
 * @method assignManager - Assign a manager to an employee (Employment domain operation).
 * @method removeManager - Remove manager from an employee (Employment domain operation).
 * @method delete - Delete an employee (both Person and Employment).
 * @method getSearchableContent - Get searchable content for RAG (includes both Person and Employment data).
 */
@injectable()
export class EmployeeController {
  private readonly presenter = new EmployeePresenter();

  constructor(
    @inject(TYPES.EmployeeApplicationService)
    private readonly employeeApplicationService: EmployeeApplicationService,
    @inject(TYPES.EmploymentService)
    private readonly employmentService: EmploymentService
  ) { }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const employeeProfiles = await this.employeeApplicationService.getAllEmployeeProfiles();

      // Use the presenter's flat pagination method that maintains frontend compatibility
      const response = this.presenter.successPaginatedFlat(employeeProfiles, req);

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

  async create(req: Request<unknown, unknown, CreateEmployeeRequestData>, res: Response): Promise<void> {
    try {
      const employeeValidation = CreateEmployeeSchema.safeParse(req.body);
      if (!employeeValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Validation failed',
          details: employeeValidation.error.issues.map(issue => issue.message)
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
            details: personValidation.error.issues.map(issue => issue.message)
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
            details: employmentValidation.error.issues.map(issue => issue.message)
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

  async promoteEmployee(req: Request<{ id: string }, unknown, PromoteEmployeeRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const promotionValidation = PromoteEmployeeSchema.safeParse(req.body);

      if (!promotionValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Validation failed',
          details: promotionValidation.error.issues.map(issue => issue.message)
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

  async terminateEmployee(req: Request<{ id: string }, unknown, TerminateEmployeeRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const terminationValidation = TerminateEmployeeSchema.safeParse(req.body);

      if (!terminationValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Validation failed',
          details: terminationValidation.error.issues.map(issue => issue.message)
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

  async assignManager(req: Request<{ id: string }, unknown, AssignManagerRequestData>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const managerValidation = AssignManagerSchema.safeParse(req.body);

      if (!managerValidation.success) {
        const errorResponse = this.presenter.error({
          message: 'Validation failed',
          details: managerValidation.error.issues.map(issue => issue.message)
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