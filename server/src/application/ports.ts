import type { CoachReport } from '@/domain/types';

/**
 * Ports: what the use case needs from the outside world, described as interfaces.
 * Infrastructure provides the real implementations (Codex, SQLite); tests provide fakes.
 */

/** Something that can turn CV text into a CoachReport (Codex today, maybe another AI later). */
export interface CoachEngine {
  analyze(cvText: string): Promise<CoachReport>;
}

export interface StoredAnalysis {
  /** SHA-256 of the trimmed CV text. The text itself is never stored. */
  cvHash: string;
  report: CoachReport;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export interface AnalysisRepository {
  findByCvHash(cvHash: string): StoredAnalysis | undefined;
  /** Saving a hash that already exists keeps the first analysis. */
  save(analysis: StoredAnalysis): void;
}
