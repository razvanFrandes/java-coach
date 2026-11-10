import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { StoredAnalysis } from '../application/ports';
import { openDatabase, SqliteAnalysisRepository } from './sqlite-analysis-repository';

const analysis: StoredAnalysis = {
  cvHash: 'abc123',
  report: { summary: 'First', assessments: [], steps: [] },
  createdAt: '2026-11-10T10:00:00.000Z',
};

describe('SqliteAnalysisRepository', () => {
  it('AC7: finds a saved analysis by hash and nothing for an unknown hash', () => {
    const repository = new SqliteAnalysisRepository(openDatabase(':memory:'));

    repository.save(analysis);

    expect(repository.findByCvHash('abc123')).toEqual(analysis);
    expect(repository.findByCvHash('unknown')).toBeUndefined();
  });

  it('AC8: keeps the first analysis when the same hash is saved twice', () => {
    const repository = new SqliteAnalysisRepository(openDatabase(':memory:'));

    repository.save(analysis);
    expect(() =>
      repository.save({ ...analysis, report: { ...analysis.report, summary: 'Second' } }),
    ).not.toThrow();

    expect(repository.findByCvHash('abc123')?.report.summary).toBe('First');
  });

  it('AC9: keeps analyses after the database file is closed and reopened', () => {
    const directory = mkdtempSync(join(tmpdir(), 'java-coach-db-'));
    const file = join(directory, 'test.db');
    try {
      const first = openDatabase(file);
      new SqliteAnalysisRepository(first).save(analysis);
      first.close();

      const reopened = openDatabase(file);
      expect(new SqliteAnalysisRepository(reopened).findByCvHash('abc123')).toEqual(analysis);
      reopened.close();
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
