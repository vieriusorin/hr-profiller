import { Candidate } from '../entities/candidate.entity';

export interface CandidateRepository {
  findAll(): Promise<Candidate[]>;
  findById(id: string): Promise<Candidate | null>;
  getStatusMetrics(): Promise<CandidateStatusMetrics>;
}

export interface CandidateStatusMetrics {
  active: number;
  screening: number;
  interviewing: number;
  offer: number;
  rejected: number;
  hired: number;
  total: number;
}
