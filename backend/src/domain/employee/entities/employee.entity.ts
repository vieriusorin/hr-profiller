import { TypeEmployeeStatus } from '../../../../db/enums/employee-status.enum';
import { TypeWorkStatus } from '../../../../db/enums/work-status.enum';
import { TypeJobGrade } from '../../../../db/enums/job-grade.enum';

// Type for the joined employee data from people + employment_details
export type EmployeeJoinedData = {
  // From people table
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  birthDate: Date | null;
  address: string | null;
  city: string | null;
  country: string | null;
  personNotes: string | null;
  personCreatedAt: Date;
  // From employment_details table
  employmentDetailsId: string | null;
  employeeId: string | null;
  hireDate: Date | null;
  terminationDate: Date | null;
  position: string | null;
  employmentType: string | null;
  salary: number | null;
  hourlyRate: number | null;
  managerId: string | null;
  employeeStatus: string | null;
  workStatus: string | null;
  jobGrade: string | null;
  location: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  employmentNotes: string | null;
  employmentCreatedAt: Date | null;
  employmentUpdatedAt: Date | null;
};

export class Employee {
  // Properties from people table
  readonly personId!: string;
  readonly firstName!: string;
  readonly lastName!: string;
  readonly fullName!: string;
  readonly email!: string;
  readonly phone!: string | null;
  readonly birthDate!: Date | null;
  readonly address!: string | null;
  readonly city!: string | null;
  readonly country!: string | null;
  readonly personNotes!: string | null;
  readonly personCreatedAt!: Date;
  
  // Properties from employment_details table
  readonly employmentDetailsId!: string | null;
  readonly employeeId!: string | null;
  readonly hireDate!: Date | null;
  readonly terminationDate!: Date | null;
  readonly position!: string | null;
  readonly employmentType!: string | null;
  readonly salary!: number | null;
  readonly hourlyRate!: number | null;
  readonly managerId!: string | null;
  readonly employeeStatus!: TypeEmployeeStatus | null;
  readonly workStatus!: TypeWorkStatus | null;
  readonly jobGrade!: TypeJobGrade | null;
  readonly location!: string | null;
  readonly emergencyContactName!: string | null;
  readonly emergencyContactPhone!: string | null;
  readonly employmentNotes!: string | null;
  readonly employmentCreatedAt!: Date | null;
  readonly employmentUpdatedAt!: Date | null;

  constructor(data: EmployeeJoinedData) {
    Object.assign(this, data);
  }

  isInactive(): boolean {
    return this.employeeStatus === 'Inactive';
  }

  isOnBench(): boolean {
    return this.workStatus === 'On Bench';
  }
} 