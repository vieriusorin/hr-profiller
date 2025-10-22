import { TypeOpportunityStatus } from '@db/enums/opportunity-status.enum';
import { TypeOpportunity } from '@db/schema';

/**
 * Includes details such as client, dates, probability, status, and comments.
 * @class Opportunity
 * @description Entity representing a business opportunity.
 * @property id - Unique identifier for the opportunity.
 * @property opportunityName - Name of the opportunity.
 * @property clientId - Reference to the client associated with the opportunity.
 * @property clientName - Name of the client.
 * @property expectedStartDate - Expected start date of the opportunity.
 * @property expectedEndDate - Expected end date of the opportunity.
 * @property probability - Probability of winning the opportunity (0-100).
 * @property status - Current status of the opportunity.
 * @property comment - Additional comments about the opportunity.
 * @property isActive - Indicates if the opportunity is currently active.
 * @property activatedAt - Date when the opportunity was activated.
 * @property createdAt - Timestamp of when the opportunity was created.
 * @property updatedAt - Timestamp of the last update to the opportunity.
 */
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

  /**
   * Check if the opportunity has a high probability of success.
   * @returns True if the probability is 80% or higher, false otherwise.
   */
  isHighProbability(): boolean {
    return this.probability !== null && this.probability >= 80;
  }

  /**
   * Check if the opportunity is expiring soon.
   * @param days The number of days to check for expiration.
   * @returns True if the opportunity is expiring within the specified number of days, false otherwise.
   */
  isExpiringSoon(days: number = 30): boolean {
    if (!this.expectedEndDate) return false;
    const endDate = new Date(this.expectedEndDate);
    const daysFromNow = new Date();
    daysFromNow.setDate(daysFromNow.getDate() + days);
    return endDate <= daysFromNow;
  }

  /**
   * Get the duration of the opportunity in days.
   * @returns The duration in days, or null if dates are not set.
   */
  getDuration(): number | null {
    if (!this.expectedStartDate || !this.expectedEndDate) return null;
    const start = new Date(this.expectedStartDate);
    const end = new Date(this.expectedEndDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}
