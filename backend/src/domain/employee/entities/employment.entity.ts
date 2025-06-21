import { TypeEmployeeStatus } from '../../../../db/enums/employee-status.enum';
import { TypeWorkStatus } from '../../../../db/enums/work-status.enum';
import { TypeJobGrade } from '../../../../db/enums/job-grade.enum';

export type EmploymentData = {
  id: string;
  personId: string; // Reference to Person entity
  employeeId: string | null;
  hireDate: Date | null;
  terminationDate: Date | null;
  position: string | null;
  employmentType: string | null;
  salary: number | null;
  hourlyRate: number | null;
  managerId: string | null;
  employeeStatus: TypeEmployeeStatus | null;
  workStatus: TypeWorkStatus | null;
  jobGrade: TypeJobGrade | null;
  location: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export class Employment {
  // Employment-specific properties only
  readonly id: string;
  readonly personId: string; // Reference to Person - this creates the relationship
  readonly employeeId: string | null;
  readonly hireDate: Date | null;
  readonly terminationDate: Date | null;
  readonly position: string | null;
  readonly employmentType: string | null;
  readonly salary: number | null;
  readonly hourlyRate: number | null;
  readonly managerId: string | null;
  readonly employeeStatus: TypeEmployeeStatus | null;
  readonly workStatus: TypeWorkStatus | null;
  readonly jobGrade: TypeJobGrade | null;
  readonly location: string | null;
  readonly emergencyContactName: string | null;
  readonly emergencyContactPhone: string | null;
  readonly notes: string | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  constructor(data: EmploymentData) {
    this.id = data.id;
    this.personId = data.personId;
    this.employeeId = data.employeeId;
    this.hireDate = data.hireDate;
    this.terminationDate = data.terminationDate;
    this.position = data.position;
    this.employmentType = data.employmentType;
    this.salary = data.salary;
    this.hourlyRate = data.hourlyRate;
    this.managerId = data.managerId;
    this.employeeStatus = data.employeeStatus;
    this.workStatus = data.workStatus;
    this.jobGrade = data.jobGrade;
    this.location = data.location;
    this.emergencyContactName = data.emergencyContactName;
    this.emergencyContactPhone = data.emergencyContactPhone;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Employment-specific business methods
  get isActive(): boolean {
    return this.employeeStatus === 'Active' && !this.terminationDate;
  }

  get isTerminated(): boolean {
    return !!this.terminationDate || this.employeeStatus === 'Inactive';
  }

  get isOnLeave(): boolean {
    return this.employeeStatus === 'On Leave';
  }

  get isAvailable(): boolean {
    return this.workStatus === 'Available' && this.isActive;
  }

  get isAssigned(): boolean {
    return this.workStatus === 'On Project' && this.isActive;
  }

  get displayPosition(): string {
    return this.position || 'No Position Assigned';
  }

  get displayLocation(): string {
    return this.location || 'No Location Assigned';
  }

  get employmentDuration(): number | null {
    if (!this.hireDate) return null;

    const endDate = this.terminationDate || new Date();
    const diffTime = Math.abs(endDate.getTime() - this.hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Employment business logic methods
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  promote(newPosition: string, _newSalary?: number, _newJobGrade?: TypeJobGrade): void {
    if (!this.isActive) {
      throw new Error('Cannot promote inactive employee');
    }

    // Note: In a real implementation, these would be handled by the repository
    // This is just showing the business logic that would be applied
    if (!newPosition || newPosition.trim().length === 0) {
      throw new Error('New position is required for promotion');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  terminate(terminationDate: Date, _reason?: string): void {
    if (this.isTerminated) {
      throw new Error('Employee is already terminated');
    }

    if (terminationDate < (this.hireDate || new Date())) {
      throw new Error('Termination date cannot be before hire date');
    }

    // Note: In a real implementation, these would be handled by the repository
    // This is just showing the business logic that would be applied
  }

  assignManager(managerId: string): void {
    if (!this.isActive) {
      throw new Error('Cannot assign manager to inactive employee');
    }

    if (managerId === this.personId) {
      throw new Error('Employee cannot be their own manager');
    }

    // Note: In a real implementation, this would be handled by the repository
    // This is just showing the business logic that would be applied
  }

  updateWorkStatus(newStatus: TypeWorkStatus): void {
    if (!this.isActive) {
      throw new Error('Cannot update work status for inactive employee');
    }

    // Business rules for work status transitions
    if (this.workStatus === 'On Project' && newStatus === 'Available') {
      // This might require additional validation (e.g., project completion)
    }

    // Note: In a real implementation, this would be handled by the repository
    // This is just showing the business logic that would be applied
  }

  // Utility methods for employment data
  getEmploymentSummary(): string {
    const sections = [
      `Employee ID: ${this.employeeId || 'Not Assigned'}`,
      `Position: ${this.displayPosition}`,
      `Status: ${this.employeeStatus || 'Unknown'}`,
      `Work Status: ${this.workStatus || 'Unknown'}`,
      `Location: ${this.displayLocation}`,
      this.salary ? `Salary: $${this.salary.toLocaleString()}` : '',
      this.hireDate ? `Hire Date: ${this.hireDate.toDateString()}` : '',
      this.terminationDate ? `Termination Date: ${this.terminationDate.toDateString()}` : ''
    ].filter(section => section.trim().length > 0);

    return sections.join('\n');
  }
} 