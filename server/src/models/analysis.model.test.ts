import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeDb, initDb } from '../db';
import type { CoachReport } from '../types';
import { findAnalysisByHash, saveAnalysis, type Analysis } from './analysis.model';

const report: CoachReport = { summary: 'First', skills: [], gaps: [], learningPath: [] };
const analysis: Analysis = { cvHash: 'abc123', report, createdAt: '2026-11-10T10:00:00.000Z' };

describe('analysis model', () => {
  beforeEach(() => {
    initDb(':memory:');
  });
  afterEach(() => closeDb());

  it('AC11: finds a saved analysis by hash and nothing for an unknown hash', () => {
    saveAnalysis(analysis);

    expect(findAnalysisByHash('abc123')).toEqual(analysis);
    expect(findAnalysisByHash('unknown')).toBeUndefined();
  });

  it('AC12: keeps the first analysis when the same hash is saved twice', () => {
    saveAnalysis(analysis);
    expect(() =>
      saveAnalysis({ ...analysis, report: { ...report, summary: 'Second' } }),
    ).not.toThrow();

    expect(findAnalysisByHash('abc123')?.report.summary).toBe('First');
  });

  it('AC13: keeps analyses after the database file is closed and reopened', () => {
    const directory = mkdtempSync(join(tmpdir(), 'java-coach-db-'));
    const file = join(directory, 'test.db');
    try {
      initDb(file);
      saveAnalysis(analysis);
      closeDb();

      initDb(file);
      expect(findAnalysisByHash('abc123')).toEqual(analysis);
    } finally {
      closeDb();
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
