import { eq, sql } from 'drizzle-orm';
import { Candidate } from '../../../domain/candidate/entities/candidate.entity';
import {
  CandidateRepository,
  CandidateStatusMetrics,
} from '../../../domain/candidate/repositories/candidate.repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';

export class DrizzleApplicantRepository implements CandidateRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findAll(): Promise<Candidate[]> {
    const candidates = await this.db.select().from(schema.candidates);
    return candidates.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Candidate | null> {
    const [candidate] = await this.db
      .select()
      .from(schema.candidates)
      .where(eq(schema.candidates.id, Number(id)));

    return candidate ? this.mapToEntity(candidate) : null;
  }

  async getStatusMetrics(): Promise<CandidateStatusMetrics> {
    const metrics: CandidateStatusMetrics = {
      active: 0,
      screening: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      hired: 0,
      total: 0,
    };

    const statusCounts = await this.db
      .select({
        status: schema.candidates.status,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.candidates)
      .groupBy(schema.candidates.status);

    for (const { status, count } of statusCounts) {
      if (status) {
        metrics[status as keyof Omit<CandidateStatusMetrics, 'total'>] = count;
      }
      metrics.total += count;
    }

    return metrics;
  }

  private mapToEntity(data: any): Candidate {
    return new Candidate(
      data.id,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.status,
      data.resumeUrl,
      data.createdAt,
      data.updatedAt
    );
  }
}
