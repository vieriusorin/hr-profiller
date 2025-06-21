import { Employment } from '../entities/employment.entity';
import { TypeEmploymentDetails } from '../../../../db/schema/employment-details.schema';

export interface CreateEmploymentData {
  personId: string;
  position: string;
  location?: string;
  salary?: number;
  hourlyRate?: number;
  employmentType?: string;
  hireDate?: Date;
  terminationDate?: Date;
  workStatus?: string;
  employeeStatus?: string;
  managerId?: string;
  notes?: string;
}

export interface EmploymentRepository {
  // Core CRUD operations for Employment
  findAll(): Promise<Employment[]>;
  findById(id: string): Promise<Employment | null>;
  findByPersonId(personId: string): Promise<Employment[]>;
  findActiveByPersonId(personId: string): Promise<Employment | null>;
  create(employmentData: CreateEmploymentData): Promise<Employment>;
  update(id: string, employmentData: Partial<TypeEmploymentDetails>): Promise<Employment>;
  delete(id: string): Promise<void>;

  // Employment-specific operations
  findByManager(managerId: string): Promise<Employment[]>;
  findByLocation(location: string): Promise<Employment[]>;
  findByWorkStatus(workStatus: string): Promise<Employment[]>;
  findByEmployeeStatus(employeeStatus: string): Promise<Employment[]>;

  // Employment relationship operations
  assignManager(employmentId: string, managerId: string): Promise<void>;
  removeManager(employmentId: string): Promise<void>;
  promoteEmployee(employmentId: string, newPosition: string, newSalary?: number): Promise<Employment>;
  terminateEmployment(employmentId: string, endDate?: Date, notes?: string): Promise<Employment>;

  // Search and filtering
  searchByText(searchText: string): Promise<Employment[]>;
  findByDateRange(startDate?: Date, endDate?: Date): Promise<Employment[]>;
} 