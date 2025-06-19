import { TypeOpportunity } from '../../../shared/types/schema.types';

export class Opportunity implements TypeOpportunity {
  readonly id!: string;
  readonly opportunityName!: string;
  readonly clientId!: string | null;
  readonly clientName!: string | null;
  readonly expectedStartDate!: Date | null;
  readonly expectedEndDate!: Date | null;
  readonly probability!: number | null;
  readonly status!: 'In Progress' | 'On Hold' | 'Done';
  readonly comment!: string | null;
  readonly isActive!: boolean | null;
  readonly activatedAt!: Date | null;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  constructor(data: TypeOpportunity) {
    Object.assign(this, data);
  }

  // ADD DOMAIN LOGIC: Business methods that belong to the entity
  isHighProbability(): boolean {
    return this.probability !== null && this.probability >= 80;
  }

  isExpiringSoon(days: number = 30): boolean {
    if (!this.expectedEndDate) return false;
    const endDate = new Date(this.expectedEndDate);
    const daysFromNow = new Date();
    daysFromNow.setDate(daysFromNow.getDate() + days);
    return endDate <= daysFromNow;
  }

  getDuration(): number | null {
    if (!this.expectedStartDate || !this.expectedEndDate) return null;
    const start = new Date(this.expectedStartDate);
    const end = new Date(this.expectedEndDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export enum OpportunityStatus {
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  DONE = 'Done',
} 