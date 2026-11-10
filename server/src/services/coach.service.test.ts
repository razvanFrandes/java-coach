import { createHash } from 'node:crypto';
import { closeDb, getDb, initDb } from '../db';
import { findAnalysisByHash } from '../models/analysis.model';
import type { CodexAnswer } from '../types';
import { HttpError } from '../utils/http-error';
import { analyzeCv } from './coach.service';
import { askCodex } from './codex.service';

// Never call the real Codex in tests: replace the whole module with a mock.
vi.mock('./codex.service', () => ({ askCodex: vi.fn() }));

const answer: CodexAnswer = {
  summary: 'A junior developer.',
  assessments: [{ area: 'spring', score: 40, evidence: ['Spring Boot'] }],
  steps: [],
};

const hashOf = (text: string) => createHash('sha256').update(text).digest('hex');

describe('analyzeCv', () => {
  beforeEach(() => {
    initDb(':memory:');
    vi.mocked(askCodex).mockReset().mockResolvedValue(answer);
  });
  afterEach(() => closeDb());

  it('AC14: asks Codex about a new CV, saves the report and says it is not cached', async () => {
    const result = await analyzeCv('My CV text');

    expect(askCodex).toHaveBeenCalledWith('My CV text');
    expect(result.cached).toBe(false);
    expect(result.report.summary).toBe('A junior developer.');
    expect(result.report.skills.find((s) => s.area === 'spring')?.level).toBe('intermediate');
    expect(findAnalysisByHash(hashOf('My CV text'))?.report).toEqual(result.report);
  });

  it('AC15: returns the saved report for the same text without asking Codex again', async () => {
    const first = await analyzeCv('My CV text');

    const second = await analyzeCv('  My CV text \n');

    expect(second).toEqual({ report: first.report, cached: true });
    expect(askCodex).toHaveBeenCalledTimes(1);
  });

  it('AC15: asks Codex again for a different text', async () => {
    await analyzeCv('My CV text');
    await analyzeCv('Another CV');

    expect(askCodex).toHaveBeenCalledTimes(2);
  });

  it('AC16: passes Codex failures on and saves nothing', async () => {
    vi.mocked(askCodex).mockRejectedValue(new HttpError(502, 'COACH_FAILED', 'Codex failed: boom'));

    await expect(analyzeCv('My CV text')).rejects.toThrow('Codex failed: boom');
    expect(findAnalysisByHash(hashOf('My CV text'))).toBeUndefined();
  });

  it('AC17: stores the SHA-256 of the trimmed text, never the text', async () => {
    await analyzeCv('  My CV text  ');

    const rows = getDb().prepare('SELECT * FROM analyses').all();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ cv_hash: hashOf('My CV text') });
    expect(JSON.stringify(rows)).not.toContain('My CV text');
  });
});
