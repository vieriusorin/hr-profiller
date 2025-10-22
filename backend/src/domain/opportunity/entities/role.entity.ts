import { TypeOpportunityRole } from '../../../../db/schema/opportunity-roles.schema';
import { TypeJobGrade } from '../../../../db/enums/job-grade.enum';
import { TypeOpportunityLevel } from '../../../../db/enums/opportunity-level.enum';
import { TypeRoleStatus } from '../../../../db/enums/role-status.enum';

/**
 * @description Data structure for assigned members in a role.
 * @interface AssignedMember
 * @property id - Unique identifier for the member.
 * @property firstName - First name of the member.
 * @property lastName - Last name of the member.
 * @property fullName - Full name of the member.
 * @property email - Email address of the member.
 * @property assignedAt - Date when the member was assigned to the role.
 */
export interface AssignedMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  assignedAt?: Date | null;
}

/**
 * @class Role
 * @description Entity representing a role within an opportunity.
 * Includes properties for role details and assigned members.
 * @property id - Unique identifier for the role.
 * @property opportunityId - Reference to the associated opportunity.
 * @property roleName - Name of the role.
 * @property jobGrade - Job grade associated with the role.
 * @property level - Level of the opportunity role.
 * @property allocation - Allocation percentage for the role.
 * @property startDate - Start date for the role.
 * @property endDate - End date for the role.
 * @property status - Current status of the role.
 * @property notes - Additional notes about the role.
 * @property createdAt - Timestamp of when the role was created.
 * @property updatedAt - Timestamp of the last update to the role.
 */
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