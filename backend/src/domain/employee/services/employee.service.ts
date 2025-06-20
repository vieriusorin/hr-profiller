import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/types';
import { EmployeeRepository } from '../repositories/employee.repository';
import { Employee } from '../entities/employee.entity';
import { TypeNewEmployee, TypeUpdateEmployee } from '../../../../db/schema/employee.schema';
import { CreateEmployeeSkillData, CreateEmployeeTechnologyData, CreateEmployeeEducationData } from '../../../infrastructure/database/repositories/drizzle-employee.repository';

@injectable()
export class EmployeeService {
  constructor(
    @inject(TYPES.EmployeeRepository)
    private readonly employeeRepository: EmployeeRepository
  ) {}

  async getAllEmployees(includeRelated: boolean = true): Promise<Employee[]> {
    return this.employeeRepository.findAll(includeRelated);
  }

  async getEmployeeById(id: string, includeRelated: boolean = true): Promise<Employee | null> {
    return this.employeeRepository.findById(id, includeRelated);
  }

  async createEmployee(employeeData: TypeNewEmployee): Promise<Employee> {
    return this.employeeRepository.create(employeeData);
  }

  async updateEmployee(id: string, employeeData: TypeUpdateEmployee): Promise<Employee> {
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.update(id, employeeData);
  }

  async deleteEmployee(id: string): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.delete(id);
  }

  // Skills management
  async addSkillToEmployee(employeeId: string, skillData: CreateEmployeeSkillData): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.addSkillToEmployee(employeeId, skillData);
  }

  async updateEmployeeSkill(employeeId: string, skillIdentifier: string, skillData: Partial<CreateEmployeeSkillData>): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.updateEmployeeSkill(employeeId, skillIdentifier, skillData);
  }

  async removeSkillFromEmployee(employeeId: string, skillIdentifier: string): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.removeSkillFromEmployee(employeeId, skillIdentifier);
  }

  // Technologies management
  async addTechnologyToEmployee(employeeId: string, technologyData: CreateEmployeeTechnologyData): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.addTechnologyToEmployee(employeeId, technologyData);
  }

  async updateEmployeeTechnology(employeeId: string, technologyIdentifier: string, technologyData: Partial<CreateEmployeeTechnologyData>): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.updateEmployeeTechnology(employeeId, technologyIdentifier, technologyData);
  }

  async removeTechnologyFromEmployee(employeeId: string, technologyIdentifier: string): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.removeTechnologyFromEmployee(employeeId, technologyIdentifier);
  }

  // Education management
  async addEducationToEmployee(employeeId: string, educationData: CreateEmployeeEducationData): Promise<string> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.addEducationToEmployee(employeeId, educationData);
  }

  async updateEmployeeEducation(employeeId: string, educationIdentifier: string, educationData: Partial<CreateEmployeeEducationData>): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.updateEmployeeEducation(employeeId, educationIdentifier, educationData);
  }

  async removeEducationFromEmployee(employeeId: string, educationIdentifier: string): Promise<void> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }
    
    return this.employeeRepository.removeEducationFromEmployee(employeeId, educationIdentifier);
  }

  // Search methods for RAG functionality
  async searchEmployeesBySkills(skillNames: string[]): Promise<Employee[]> {
    return this.employeeRepository.searchEmployeesBySkills(skillNames);
  }

  async searchEmployeesByTechnologies(technologyNames: string[]): Promise<Employee[]> {
    return this.employeeRepository.searchEmployeesByTechnologies(technologyNames);
  }

  async searchEmployeesByEducation(institution?: string, degree?: string, fieldOfStudy?: string): Promise<Employee[]> {
    return this.employeeRepository.searchEmployeesByEducation(institution, degree, fieldOfStudy);
  }
} 