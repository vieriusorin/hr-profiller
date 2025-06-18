import { BasePresenter } from './base.presenter';
import { CandidatesStatusMetricsDto } from '@base/domain/candidate/dtos/candidates-metrics.dto';

/**
 * Response model for applicant metrics
 */
export interface CandidateMetricsResponse {
  recruitmentFunnel: {
    stages: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    summary: {
      totalApplicants: number;
    };
  };
}
/**
 * Presenter for applicant metrics
 */
export class CandidateMetricsPresenter extends BasePresenter<
  CandidatesStatusMetricsDto,
  CandidateMetricsResponse
> {
  /**
   * Transform metrics DTO to a user-friendly response
   */
  present(metrics: CandidatesStatusMetricsDto): CandidateMetricsResponse {
    const stages = [
      { key: 'applied', label: 'Applied' },
      { key: 'screening', label: 'Screening' },
      { key: 'interview', label: 'Interview' },
      { key: 'offer', label: 'Offer' },
      { key: 'rejected', label: 'Rejected' },
      { key: 'hired', label: 'Hired' },
    ].map(stage => {
      const count = metrics[stage.key as keyof CandidatesStatusMetricsDto] as number;
      return {
        name: stage.label,
        count,
        percentage: metrics.total > 0 ? Math.round((count / metrics.total) * 1000) / 10 : 0,
      };
    });

    return {
      recruitmentFunnel: {
        stages,
        summary: {
          totalApplicants: metrics.total,
        },
      },
    };
  }
}
