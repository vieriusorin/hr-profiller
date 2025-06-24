import { TypeOpportunityStatus } from '@db/enums/opportunity-status.enum';
import { TypeOpportunity } from '@db/schema';

export class Opportunity implements Omit<TypeOpportunity, 'expectedStartDate' | 'expectedEndDate'> {
  readonly id!: string;
  readonly opportunityName!: string;
  readonly clientId!: string | null;
  readonly clientName!: string | null;
  readonly expectedStartDate!: Date | null;
  readonly expectedEndDate!: Date | null;
  readonly probability!: number | null;
  readonly status!: TypeOpportunityStatus;
  readonly comment!: string | null;
  readonly isActive!: boolean | null;
  readonly activatedAt!: Date | null;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  constructor(data: TypeOpportunity) {
    const parseDate = (dateValue: string | Date | null): Date | null => {
      if (!dateValue) return null;
      if (dateValue instanceof Date) return dateValue;
      if (typeof dateValue === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return new Date(dateValue + 'T00:00:00.000Z');
        }
        return new Date(dateValue);
      }
      return null;
    };

    Object.assign(this, {
      ...data,
      expectedStartDate: parseDate(data.expectedStartDate),
      expectedEndDate: parseDate(data.expectedEndDate),
      activatedAt: parseDate(data.activatedAt),
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    });
  }

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
