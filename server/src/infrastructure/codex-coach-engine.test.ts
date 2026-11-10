import type { CoachReport } from '@/domain/types';
import { CoachFailedError, CoachTimeoutError } from '../application/errors';
import { coachReportJsonSchema } from '../application/coach-report-schema';
import { CodexCoachEngine, type CodexClient, type CodexThread } from './codex-coach-engine';

const report: CoachReport = {
  summary: 'A junior developer.',
  assessments: [{ area: 'spring', score: 40, evidence: ['Spring Boot'] }],
  steps: [],
};

/** A stand-in for the Codex SDK: records what it was asked and answers with `run`. */
function fakeCodex(run: CodexThread['run']) {
  const startThread = vi.fn(() => ({ run }));
  return { client: { startThread } as CodexClient, startThread };
}

describe('CodexCoachEngine', () => {
  it('AC11: runs Codex read-only, offline, without approvals, in a temp directory', async () => {
    const run = vi.fn(() => Promise.resolve({ finalResponse: JSON.stringify(report) }));
    const { client, startThread } = fakeCodex(run);

    await new CodexCoachEngine({ codex: client, timeoutMs: 1000 }).analyze('cv');

    expect(startThread).toHaveBeenCalledWith(
      expect.objectContaining({
        sandboxMode: 'read-only',
        approvalPolicy: 'never',
        networkAccessEnabled: false,
        webSearchMode: 'disabled',
        skipGitRepoCheck: true,
        workingDirectory: expect.stringContaining('java-coach-codex-'),
      }),
    );
    expect(run).toHaveBeenCalledWith(
      expect.stringContaining('<cv>\ncv\n</cv>'),
      expect.objectContaining({ outputSchema: coachReportJsonSchema }),
    );
  });

  it('AC12: parses the answer and clamps scores to 0-100', async () => {
    const answer = {
      ...report,
      assessments: [
        { area: 'spring', score: 140, evidence: [] },
        { area: 'jvm', score: -3, evidence: [] },
      ],
    };
    const { client } = fakeCodex(() => Promise.resolve({ finalResponse: JSON.stringify(answer) }));

    const result = await new CodexCoachEngine({ codex: client, timeoutMs: 1000 }).analyze('cv');

    expect(result.assessments.map((a) => a.score)).toEqual([100, 0]);
  });

  it.each([['not json at all'], [JSON.stringify({ summary: 'only a summary' })]])(
    'AC13: rejects an answer outside the contract (%s)',
    async (finalResponse) => {
      const { client } = fakeCodex(() => Promise.resolve({ finalResponse }));
      const engine = new CodexCoachEngine({ codex: client, timeoutMs: 1000 });

      const failure = engine.analyze('cv');

      await expect(failure).rejects.toBeInstanceOf(CoachFailedError);
      await expect(failure).rejects.toThrow(
        'Codex returned an answer that does not match the CoachReport contract.',
      );
    },
  );

  it('AC13: explains when Codex is not logged in', async () => {
    const { client } = fakeCodex(() =>
      Promise.reject(
        new Error('unexpected status 401 Unauthorized: Missing bearer authentication'),
      ),
    );

    await expect(
      new CodexCoachEngine({ codex: client, timeoutMs: 1000 }).analyze('cv'),
    ).rejects.toThrow(
      'Codex is not logged in on the server. Run `pnpm exec codex login` and try again.',
    );
  });

  it('AC13: reports other Codex errors with their reason', async () => {
    const { client } = fakeCodex(() => Promise.reject(new Error('model overloaded')));

    await expect(
      new CodexCoachEngine({ codex: client, timeoutMs: 1000 }).analyze('cv'),
    ).rejects.toThrow('Codex failed: model overloaded');
  });

  it('AC14: aborts and fails with a timeout error when Codex is too slow', async () => {
    const run = vi.fn(
      (_input: string, options?: { signal?: AbortSignal }) =>
        new Promise<{ finalResponse: string }>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const { client } = fakeCodex(run);

    const failure = new CodexCoachEngine({ codex: client, timeoutMs: 20 }).analyze('cv');

    await expect(failure).rejects.toBeInstanceOf(CoachTimeoutError);
    await expect(failure).rejects.toThrow('Codex did not answer within 0.02 seconds.');
  });
});
