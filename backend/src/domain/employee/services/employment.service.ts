import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { EmploymentRepository, CreateEmploymentData } from '../repositories/employment.repository';
import { Employment } from '../entities/employment.entity';
import { TypeEmploymentDetails } from '../../../../db/schema/employment-details.schema';

@injectable()
export class EmploymentService {
  constructor(
    @inject(TYPES.EmploymentRepository)
    private readonly employmentRepository: EmploymentRepository
  ) { }

  // Core employment operations
  async getAllEmployments(): Promise<Employment[]> {
    return this.employmentRepository.findAll();
  }

  async getEmploymentById(id: string): Promise<Employment | null> {
    return this.employmentRepository.findById(id);
  }

  async getEmploymentsByPersonId(personId: string): Promise<Employment[]> {
    return this.employmentRepository.findByPersonId(personId);
  }

  async getActiveEmploymentByPersonId(personId: string): Promise<Employment | null> {
    return this.employmentRepository.findActiveByPersonId(personId);
  }

  async createEmployment(employmentData: CreateEmploymentData): Promise<Employment> {
    // Business validation
    if (!employmentData.personId) {
      throw new Error('Person ID is required for employment');
    }

    if (!employmentData.position || employmentData.position.trim().length === 0) {
      throw new Error('Position is required for employment');
    }

    // Business rule: Check if person already has active employment
    const existingActiveEmployment = await this.employmentRepository.findActiveByPersonId(employmentData.personId);
    if (existingActiveEmployment && !employmentData.terminationDate) {
      throw new Error('Person already has active employment. End existing employment first or specify termination date for new employment.');
    }

    // Business rule: Validate date logic
    if (employmentData.hireDate && employmentData.terminationDate) {
      if (employmentData.hireDate > employmentData.terminationDate) {
        throw new Error('Hire date cannot be after termination date');
      }
    }

    // Business rule: Validate salary vs hourly rate
    if (employmentData.salary && employmentData.hourlyRate) {
      throw new Error('Cannot specify both salary and hourly rate. Choose one compensation method.');
    }

    return this.employmentRepository.create(employmentData);
  }

  async updateEmployment(id: string, employmentData: Partial<TypeEmploymentDetails>): Promise<Employment> {
    const existingEmployment = await this.employmentRepository.findById(id);
    if (!existingEmployment) {
      throw new Error('Employment record not found');
    }

    // Business rule: Validate date logic if dates are being updated
    if (employmentData.hireDate || employmentData.terminationDate) {
      const hireDate = employmentData.hireDate || existingEmployment.hireDate;
      const terminationDate = employmentData.terminationDate || existingEmployment.terminationDate;

      if (hireDate && terminationDate && hireDate > terminationDate) {
        throw new Error('Hire date cannot be after termination date');
      }
    }

    // Business rule: Validate salary vs hourly rate
    if (employmentData.salary && employmentData.hourlyRate) {
      throw new Error('Cannot specify both salary and hourly rate. Choose one compensation method.');
    }

    return this.employmentRepository.update(id, employmentData);
  }

  async deleteEmployment(id: string): Promise<void> {
    const existingEmployment = await this.employmentRepository.findById(id);
    if (!existingEmployment) {
      throw new Error('Employment record not found');
    }

    return this.employmentRepository.delete(id);
  }

  // Employment-specific business operations
  async getEmploymentsByManager(managerId: string): Promise<Employment[]> {
    return this.employmentRepository.findByManager(managerId);
  }

  async getEmploymentsByLocation(location: string): Promise<Employment[]> {
    if (!location || location.trim().length === 0) {
      throw new Error('Location name is required');
    }

    return this.employmentRepository.findByLocation(location.trim());
  }

  async getEmploymentsByWorkStatus(workStatus: string): Promise<Employment[]> {
    if (!workStatus || workStatus.trim().length === 0) {
      throw new Error('Work status is required');
    }

    return this.employmentRepository.findByWorkStatus(workStatus.trim());
  }

  async getEmploymentsByEmployeeStatus(employeeStatus: string): Promise<Employment[]> {
    if (!employeeStatus || employeeStatus.trim().length === 0) {
      throw new Error('Employee status is required');
    }

    return this.employmentRepository.findByEmployeeStatus(employeeStatus.trim());
  }

  // Employment relationship management
  async assignManager(employmentId: string, managerId: string): Promise<void> {
    const employment = await this.employmentRepository.findById(employmentId);
    if (!employment) {
      throw new Error('Employment record not found');
    }

    // Business rule: Cannot assign self as manager
    if (employment.personId === managerId) {
      throw new Error('Employee cannot be their own manager');
    }

    // Business rule: Manager must have active employment
    const managerEmployment = await this.employmentRepository.findActiveByPersonId(managerId);
    if (!managerEmployment) {
      throw new Error('Manager must have active employment record');
    }

    return this.employmentRepository.assignManager(employmentId, managerId);
  }

  async removeManager(employmentId: string): Promise<void> {
    const employment = await this.employmentRepository.findById(employmentId);
    if (!employment) {
      throw new Error('Employment record not found');
    }

    return this.employmentRepository.removeManager(employmentId);
  }

  async promoteEmployee(employmentId: string, newPosition: string, newSalary?: number): Promise<Employment> {
    const employment = await this.employmentRepository.findById(employmentId);
    if (!employment) {
      throw new Error('Employment record not found');
    }

    if (!newPosition || newPosition.trim().length === 0) {
      throw new Error('New position is required for promotion');
    }

    // Business rule: Position should be different from current
    if (employment.position === newPosition.trim()) {
      throw new Error('New position must be different from current position');
    }

    // Business rule: Salary increase validation (if provided)
    if (newSalary !== undefined) {
      if (newSalary <= 0) {
        throw new Error('Salary must be positive');
      }

      if (employment.salary && newSalary <= employment.salary) {
        throw new Error('Promotion salary should be higher than current salary');
      }
    }

    return this.employmentRepository.promoteEmployee(employmentId, newPosition.trim(), newSalary);
  }

  async terminateEmployment(employmentId: string, endDate?: Date, notes?: string): Promise<Employment> {
    const employment = await this.employmentRepository.findById(employmentId);
    if (!employment) {
      throw new Error('Employment record not found');
    }

    // Business rule: Cannot terminate already terminated employment
    if (employment.terminationDate) {
      throw new Error('Employment is already terminated');
    }

    // Business rule: End date cannot be before hire date
    const terminationDate = endDate || new Date();
    if (employment.hireDate && terminationDate < employment.hireDate) {
      throw new Error('Termination date cannot be before employment hire date');
    }

    return this.employmentRepository.terminateEmployment(employmentId, terminationDate, notes);
  }

  // Search and reporting
  async searchEmployments(searchText: string): Promise<Employment[]> {
    if (!searchText || searchText.trim().length === 0) {
      throw new Error('Search text is required');
    }

    return this.employmentRepository.searchByText(searchText.trim());
  }

  async getEmploymentsByDateRange(startDate?: Date, endDate?: Date): Promise<Employment[]> {
    if (!startDate && !endDate) {
      throw new Error('At least one date (start or end) is required for date range search');
    }

    if (startDate && endDate && startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }

    return this.employmentRepository.findByDateRange(startDate, endDate);
  }

  // Business analytics
  async getEmploymentStatistics(): Promise<{
    totalEmployments: number;
    activeEmployments: number;
    terminatedEmployments: number;
    departmentCounts: Record<string, number>;
    positionCounts: Record<string, number>;
  }> {
    const allEmployments = await this.employmentRepository.findAll();

    const activeEmployments = allEmployments.filter(emp => !emp.terminationDate);
    const terminatedEmployments = allEmployments.filter(emp => emp.terminationDate);

    const departmentCounts = allEmployments.reduce((acc, emp) => {
      const dept = emp.location || 'Unknown'; // Using location as department equivalent
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const positionCounts = allEmployments.reduce((acc, emp) => {
      const position = emp.position || 'Unknown';
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEmployments: allEmployments.length,
      activeEmployments: activeEmployments.length,
      terminatedEmployments: terminatedEmployments.length,
      departmentCounts,
      positionCounts,
    };
  }
} 