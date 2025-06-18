export class Candidate {
  constructor(
    readonly id: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly phone: string,
    readonly status: CandidateStatus,
    readonly resumeUrl: string,
    readonly createdAt: Date,
    readonly updatedAt: Date
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export enum CandidateStatus {
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  REJECTED = 'rejected',
  HIRED = 'hired',
}
