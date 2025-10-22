import { Employment } from '../entities/employment.entity';
import { TypeEmploymentDetails } from '../../../../db/schema/employment-details.schema';

/**
 * @description Data structure for creating a new Employment record.
 * @interface CreateEmploymentData
 * @property personId - Reference to Person entity.
 * @property position - Job position.
 * @property location - Work location.
 * @property salary - Salary amount.
 * @property hourlyRate - Hourly rate amount.
 * @property employmentType - Type of employment (e.g., Full-time, Part-time).
 * @property hireDate - Date of hire.
 * @property terminationDate - Date of termination.
 * @property workStatus - Current work status of the employee.
 * @property employeeStatus - Current status of the employee.
 * @property managerId - Reference to the manager's employment record.
 * @property notes - Additional notes about the employment.
 */
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

/**
 * @description Repository interface for Employment entity.
 * Defines methods for CRUD operations and employment-specific actions.
 * @interface EmploymentRepository
 * @method findAll - Retrieve all employment records.
 * @method findById - Retrieve an employment record by its ID.
 * @method findByPersonId - Get employment records by person ID.
 * @method findActiveByPersonId - Get active employment record by person ID.
 * @method create - Create a new employment record.
 * @method update - Update an existing employment record.
 * @method delete - Delete an employment record by its ID.
 * @method findByManager - Get employment records by manager ID.
 * @method findByLocation - Get employment records by location.
 * @method findByWorkStatus - Get employment records by work status.
 * @method findByEmployeeStatus - Get employment records by employee status.
 * @method assignManager - Assign a manager to an employment record.
 * @method removeManager - Remove the manager from an employment record.
 * @method promoteEmployee - Promote an employee to a new position.
 * @method terminateEmployment - Terminate an employment record.
 * @method searchByText - Search for employment records by text.
 * @method findByDateRange - Find employment records by date range.
 */
export interface EmploymentRepository {
  // Core CRUD operations for Employment

  /**
   * Retrieve all employment records.
   * @returns A promise that resolves to an array of Employment entities.
   */
  findAll(): Promise<Employment[]>;
  /**
   * Retrieve an employment record by its ID.
   * @param id The ID of the employment record.
   * @returns A promise that resolves to the Employment entity or null if not found.
   */
  findById(id: string): Promise<Employment | null>;
  /**
   * Get employment records by person ID.
   * @param personId The ID of the person.
   * @returns A promise that resolves to an array of Employment entities.
   */
  findByPersonId(personId: string): Promise<Employment[]>;
  /**
   * Get active employment record by person ID.
   * @param personId The ID of the person.
   * @returns A promise that resolves to the active Employment entity or null if not found.
   */
  findActiveByPersonId(personId: string): Promise<Employment | null>;
  /**
   * Create a new employment record.
   * @param employmentData The data for the new employment record.
   * @returns A promise that resolves to the created Employment entity.
   */
  create(employmentData: CreateEmploymentData): Promise<Employment>;
  /**
   * Update an existing employment record.
   * @param id The ID of the employment record.
   * @param employmentData The updated data for the employment record.
   * @returns A promise that resolves to the updated Employment entity.
   */
  update(id: string, employmentData: Partial<TypeEmploymentDetails>): Promise<Employment>;
  /**
   * Delete an employment record by its ID.
   * @param id The ID of the employment record.
   * @returns A promise that resolves when the employment record is deleted.
   */
  delete(id: string): Promise<void>;

  // Employment-specific operations
  /**
   * Get employment records by manager ID.
   * @param managerId The ID of the manager.
   * @returns A promise that resolves to an array of Employment entities.
   */
  findByManager(managerId: string): Promise<Employment[]>;
  /**
   * Get employment records by location.
   * @param location The location to filter by.
   * @returns A promise that resolves to an array of Employment entities.
   */
  findByLocation(location: string): Promise<Employment[]>;
  /**
   * Get employment records by work status.
   * @param workStatus The work status to filter by.
   * @returns A promise that resolves to an array of Employment entities.
   */
  findByWorkStatus(workStatus: string): Promise<Employment[]>;
  /**
   * Get employment records by employee status.
   * @param employeeStatus The employee status to filter by.
   * @returns A promise that resolves to an array of Employment entities.
   */
  findByEmployeeStatus(employeeStatus: string): Promise<Employment[]>;

  // Employment relationship operations
  /**
   * Assign a manager to an employment record.
   * @param employmentId The ID of the employment record.
   * @param managerId The ID of the manager.
   */
  assignManager(employmentId: string, managerId: string): Promise<void>;
  /**
   * Remove the manager from an employment record.
   * @param employmentId The ID of the employment record.
   */
  removeManager(employmentId: string): Promise<void>;
  /**
   * Promote an employee to a new position.
   * @param employmentId The ID of the employment record.
   * @param newPosition The new position for the employee.
   * @param newSalary (Optional) The new salary for the employee.
   * @returns A promise that resolves to the updated Employment entity.
   */
  promoteEmployee(employmentId: string, newPosition: string, newSalary?: number): Promise<Employment>;
  /**
   * Terminate an employment record.
   * @param employmentId The ID of the employment record.
   * @param endDate (Optional) The end date of the employment.
   * @param notes (Optional) Additional notes for the termination.
   * @returns A promise that resolves to the terminated Employment entity.
   */
  terminateEmployment(employmentId: string, endDate?: Date, notes?: string): Promise<Employment>;

  // Search and filtering
  /**
   * Search for employment records by text.
   * @param searchText The text to search for.
   * @returns A promise that resolves to an array of matching Employment entities.
   */
  searchByText(searchText: string): Promise<Employment[]>;
  /**
   * Find employment records by date range.
   * @param startDate (Optional) The start date of the range.
   * @param endDate (Optional) The end date of the range.
   * @returns A promise that resolves to an array of matching Employment entities.
   */
  findByDateRange(startDate?: Date, endDate?: Date): Promise<Employment[]>;
} 