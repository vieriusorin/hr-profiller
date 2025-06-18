import { CandidateRepository, CandidateStatusMetrics } from '../repositories/candidate.repository';

export class CandidateMetricsService {
  constructor(private readonly candidateRepository: CandidateRepository) {}

  async getStatusMetrics(): Promise<CandidateStatusMetrics> {
    return this.candidateRepository.getStatusMetrics();
  }
}
