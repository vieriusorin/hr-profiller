export class Opportunity {
  constructor(
    readonly id: string,
    readonly opportunityName: string,
    readonly clientId: string | null,
    readonly clientName: string | null,
    readonly expectedStartDate: Date | null,
    readonly expectedEndDate: Date | null,
    readonly probability: number | null,
    readonly status: OpportunityStatus,
    readonly comment: string | null,
    readonly isActive: boolean,
    readonly activatedAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}
}

export enum OpportunityStatus {
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  DONE = 'Done',
} 