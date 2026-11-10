import { createHash } from 'node:crypto';
import type { CoachReport } from '@/domain/types';
import type { AnalysisRepository, CoachEngine } from './ports';

export interface AnalyzeCvResult {
  report: CoachReport;
  /** True when the report came from the database instead of a new AI call. */
  cached: boolean;
}

/**
 * Use case: analyse a CV, reusing a stored report when the same CV was seen before.
 * Depends only on the ports, so it knows nothing about Codex, SQLite or HTTP.
 */
export class AnalyzeCv {
  private readonly engine: CoachEngine;
  private readonly repository: AnalysisRepository;
  private readonly now: () => Date;

  constructor(
    engine: CoachEngine,
    repository: AnalysisRepository,
    now: () => Date = () => new Date(),
  ) {
    this.engine = engine;
    this.repository = repository;
    this.now = now;
  }

  async execute(cvText: string): Promise<AnalyzeCvResult> {
    const text = cvText.trim();
    const cvHash = createHash('sha256').update(text).digest('hex');

    const stored = this.repository.findByCvHash(cvHash);
    if (stored) return { report: stored.report, cached: true };

    const report = await this.engine.analyze(text);
    this.repository.save({ cvHash, report, createdAt: this.now().toISOString() });
    return { report, cached: false };
  }
}
