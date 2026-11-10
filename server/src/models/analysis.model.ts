import { getDb } from '../db';
import type { CoachReport } from '../types';

/** One analysed CV. Only the hash of the CV text is stored, never the text itself. */
export interface Analysis {
  /** SHA-256 of the trimmed CV text. */
  cvHash: string;
  report: CoachReport;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

interface AnalysisRow {
  cv_hash: string;
  report_json: string;
  created_at: string;
}

export function findAnalysisByHash(cvHash: string): Analysis | undefined {
  const row = getDb()
    .prepare<[string], AnalysisRow>(
      'SELECT cv_hash, report_json, created_at FROM analyses WHERE cv_hash = ?',
    )
    .get(cvHash);
  if (!row) return undefined;
  return {
    cvHash: row.cv_hash,
    report: JSON.parse(row.report_json) as CoachReport,
    createdAt: row.created_at,
  };
}

/** Saving a hash that already exists keeps the first analysis. */
export function saveAnalysis(analysis: Analysis): void {
  // Two requests for the same new CV can race; the second insert is simply ignored.
  getDb()
    .prepare(
      'INSERT INTO analyses (cv_hash, report_json, created_at) VALUES (?, ?, ?) ON CONFLICT(cv_hash) DO NOTHING',
    )
    .run(analysis.cvHash, JSON.stringify(analysis.report), analysis.createdAt);
}
