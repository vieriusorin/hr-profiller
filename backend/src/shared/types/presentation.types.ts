import { TypeOpportunity } from './schema.types';
import { Role } from '../../domain/opportunity/entities/role.entity';
import { EmployeeJoinedData } from '../../domain/employee/entities/employee.entity';

/**
 * Opportunity presentation type
 * Base: TypeOpportunity (from schema)
 * + Computed fields from business logic
 */
export interface OpportunityPresentation extends TypeOpportunity {
  isHighProbability: boolean;   // >= 80% probability
  duration: number | null;      // Project duration in days
  isExpiringSoon: boolean;      // Expiring within 30 days
  roles: Role[];
}

export type EmployeePresentation = EmployeeJoinedData & {
  isInactive: boolean;
  isOnBench: boolean;
};