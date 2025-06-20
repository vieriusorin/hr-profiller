import { Employee } from '../entities/employee.entity';
import { TypeNewEmployee, TypeUpdateEmployee } from '../../../../db/schema/employee.schema';
import { CreateEmployeeSkillData, CreateEmployeeTechnologyData, CreateEmployeeEducationData } from '../../../infrastructure/database/repositories/drizzle-employee.repository';

export interface EmployeeRepository {
  // Core CRUD operations
  findAll(includeRelated?: boolean): Promise<Employee[]>;
  findById(id: string, includeRelated?: boolean): Promise<Employee | null>;
  create(employeeData: TypeNewEmployee): Promise<Employee>;
  update(id: string, employeeData: TypeUpdateEmployee): Promise<Employee>;
  delete(id: string): Promise<void>;

  // Skills management
  addSkillToEmployee(employeeId: string, skillData: CreateEmployeeSkillData): Promise<void>;
  updateEmployeeSkill(employeeId: string, skillIdentifier: string, skillData: Partial<CreateEmployeeSkillData>): Promise<void>;
  removeSkillFromEmployee(employeeId: string, skillIdentifier: string): Promise<void>;

  // Technologies management
  addTechnologyToEmployee(employeeId: string, technologyData: CreateEmployeeTechnologyData): Promise<void>;
  updateEmployeeTechnology(employeeId: string, technologyIdentifier: string, technologyData: Partial<CreateEmployeeTechnologyData>): Promise<void>;
  removeTechnologyFromEmployee(employeeId: string, technologyIdentifier: string): Promise<void>;

  // Education management
  addEducationToEmployee(employeeId: string, educationData: CreateEmployeeEducationData): Promise<string>;
  updateEmployeeEducation(educationId: string, educationData: Partial<CreateEmployeeEducationData>): Promise<void>;
  removeEducationFromEmployee(educationId: string): Promise<void>;

  // Search methods for RAG functionality
  searchEmployeesBySkills(skillNames: string[]): Promise<Employee[]>;
  searchEmployeesByTechnologies(technologyNames: string[]): Promise<Employee[]>;
  searchEmployeesByEducation(institution?: string, degree?: string, fieldOfStudy?: string): Promise<Employee[]>;
} 