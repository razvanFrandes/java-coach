import { createHash } from 'node:crypto';
import type { CoachReport } from '@/domain/types';
import { AnalyzeCv } from './analyze-cv';
import type { AnalysisRepository, CoachEngine, StoredAnalysis } from './ports';

const report: CoachReport = {
  summary: 'A junior developer.',
  assessments: [{ area: 'spring', score: 40, evidence: ['Spring Boot'] }],
  steps: [],
};

class InMemoryAnalysisRepository implements AnalysisRepository {
  readonly saved: StoredAnalysis[] = [];
  findByCvHash(cvHash: string) {
    return this.saved.find((a) => a.cvHash === cvHash);
  }
  save(analysis: StoredAnalysis) {
    this.saved.push(analysis);
  }
}

function setup(engine: CoachEngine = { analyze: vi.fn(() => Promise.resolve(report)) }) {
  const repository = new InMemoryAnalysisRepository();
  const useCase = new AnalyzeCv(engine, repository, () => new Date('2026-11-10T10:00:00Z'));
  return { engine, repository, useCase };
}

describe('AnalyzeCv', () => {
  it('AC1: analyses a new CV, saves it and reports it as not cached', async () => {
    const { engine, repository, useCase } = setup();

    const result = await useCase.execute('My CV text');

    expect(result).toEqual({ report, cached: false });
    expect(engine.analyze).toHaveBeenCalledWith('My CV text');
    expect(repository.saved).toHaveLength(1);
  });

  it('AC2: returns the saved report for the same text without asking the engine', async () => {
    const { engine, useCase } = setup();
    await useCase.execute('My CV text');

    const result = await useCase.execute('  My CV text \n');

    expect(result).toEqual({ report, cached: true });
    expect(engine.analyze).toHaveBeenCalledTimes(1);
  });

  it('AC2: analyses a different text again', async () => {
    const { engine, useCase } = setup();
    await useCase.execute('My CV text');

    await useCase.execute('Another CV');

    expect(engine.analyze).toHaveBeenCalledTimes(2);
  });

  it('AC3: passes engine failures on and saves nothing', async () => {
    const { repository, useCase } = setup({
      analyze: () => Promise.reject(new Error('Codex failed: not logged in')),
    });

    await expect(useCase.execute('My CV text')).rejects.toThrow('Codex failed: not logged in');
    expect(repository.saved).toEqual([]);
  });

  it('AC4: stores the SHA-256 of the trimmed text, never the text', async () => {
    const { repository, useCase } = setup();

    await useCase.execute('  My CV text  ');

    expect(repository.saved[0]).toEqual({
      cvHash: createHash('sha256').update('My CV text').digest('hex'),
      report,
      createdAt: '2026-11-10T10:00:00.000Z',
    });
    expect(JSON.stringify(repository.saved)).not.toContain('My CV text');
  });
});
