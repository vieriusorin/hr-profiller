import { DrizzleApplicantRepository } from './database/repositories/drizzle-candidate.repository';

import { CandidateMetricsService } from '../domain/candidate/services/candidate-metrics.service';
import { GetCandidateMetricsQuery } from '../domain/candidate/queries/get-applicant-metrics.query';
import { CandidateController } from './http/controllers/candidate.controller';

import db from './database/index';
import { CandidateMetricsPresenter } from '../interfaces/presenters/candidate.presenter';

export const container = {
  db: db as any,
  applicantRepository: new DrizzleApplicantRepository(db as any),
  resolve: function (target: typeof CandidateController) {
    if (target === CandidateController) {
      const applicantMetricsService = new CandidateMetricsService(this.applicantRepository);
      const getApplicantMetricsQuery = new GetCandidateMetricsQuery(applicantMetricsService);
      const applicantMetricsPresenter = new CandidateMetricsPresenter();
      return new CandidateController(getApplicantMetricsQuery, applicantMetricsPresenter);
    }

    throw new Error(`Cannot resolve dependency for ${target.name}`);
  },
};
