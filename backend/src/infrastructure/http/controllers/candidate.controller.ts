import { Request, Response } from 'express';
import { GetCandidateMetricsQuery } from '@base/domain/candidate/queries/get-applicant-metrics.query';
import { CandidateMetricsPresenter } from '@base/interfaces/presenters/candidate.presenter';

export class CandidateController {
  constructor(
    private readonly getCandidateMetricsQuery: GetCandidateMetricsQuery,
    private readonly candidateMetricsPresenter: CandidateMetricsPresenter
  ) {}

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.getCandidateMetricsQuery.execute();
      // Use the presenter to format the response
      const response = this.candidateMetricsPresenter.success(metrics, {
        endpoint: req.originalUrl,
      });

      res.status(200).json(response);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(error);
      // Use the presenter to format the error
      const errorResponse = this.candidateMetricsPresenter.error(error);

      const statusCode = error.statusCode || 500;

      res.status(statusCode).json(errorResponse);
    }
  }
}
