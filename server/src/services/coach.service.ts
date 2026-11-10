import { createHash } from 'node:crypto';
import { findAnalysisByHash, saveAnalysis } from '../models/analysis.model';
import type { AnalyzeResult } from '../types';
import { askCodex } from './codex.service';
import { buildReport } from './report.service';

/**
 * Analyses a CV. The same CV text (ignoring surrounding whitespace) is answered from the
 * database, so Codex is asked only once per CV.
 */
export async function analyzeCv(cvText: string): Promise<AnalyzeResult> {
  const text = cvText.trim();
  const cvHash = createHash('sha256').update(text).digest('hex');

  const saved = findAnalysisByHash(cvHash);
  if (saved) return { report: saved.report, cached: true };

  const report = buildReport(await askCodex(text));
  saveAnalysis({ cvHash, report, createdAt: new Date().toISOString() });
  return { report, cached: false };
}
