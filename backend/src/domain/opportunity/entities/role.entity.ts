import { TypeOpportunityRole } from '../../../../db/schema/opportunity-roles.schema';
import { TypeJobGrade } from '../../../../db/enums/job-grade.enum';
import { TypeOpportunityLevel } from '../../../../db/enums/opportunity-level.enum';
import { TypeRoleStatus } from '../../../../db/enums/role-status.enum';

export interface AssignedMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  assignedAt?: Date | null;
}

export class Role implements TypeOpportunityRole {
  readonly id!: string;
  readonly opportunityId!: string;
  readonly roleName!: string;
  readonly jobGrade!: TypeJobGrade | null;
  readonly level!: TypeOpportunityLevel | null;
  readonly allocation!: number | null;
  readonly startDate!: Date | null;
  readonly endDate!: Date | null;
  readonly status!: TypeRoleStatus;
  readonly notes!: string | null;
  readonly createdAt!: Date | null;
  readonly updatedAt!: Date | null;

  // Additional property for assigned members
  public assignedMembers?: AssignedMember[];

  constructor(data: TypeOpportunityRole & { assignedMembers?: AssignedMember[] }) {
    Object.assign(this, data);
  }
} 