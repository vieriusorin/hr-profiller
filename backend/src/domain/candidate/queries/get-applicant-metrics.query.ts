import { CandidateMetricsService } from '../services/candidate-metrics.service';
import { CandidatesStatusMetricsDto } from '../dtos/candidates-metrics.dto';

export class GetCandidateMetricsQuery {
  constructor(private readonly candidateMetricsService: CandidateMetricsService) {}

  async execute(): Promise<CandidatesStatusMetricsDto> {
    const metrics = await this.candidateMetricsService.getStatusMetrics();

    return {
      applied: metrics.active,
      screening: metrics.screening,
      interview: metrics.interviewing,
      offer: metrics.offer,
      rejected: metrics.rejected,
      hired: metrics.hired,
      total: metrics.total,
    };
  }
}
