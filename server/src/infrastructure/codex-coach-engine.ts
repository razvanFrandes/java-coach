import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ThreadOptions, TurnOptions } from '@openai/codex-sdk';
import type { CoachReport } from '@/domain/types';
import { coachReportJsonSchema, coachReportSchema } from '../application/coach-report-schema';
import { CoachFailedError, CoachTimeoutError } from '../application/errors';
import type { CoachEngine } from '../application/ports';
import { buildCoachPrompt } from './codex-prompt';

/** The part of the Codex SDK this engine uses. The real `Codex` class fits; tests pass a fake. */
export interface CodexThread {
  run(input: string, options?: TurnOptions): Promise<{ finalResponse: string }>;
}
export interface CodexClient {
  startThread(options?: ThreadOptions): CodexThread;
}

interface CodexCoachEngineOptions {
  codex: CodexClient;
  timeoutMs: number;
  /** Leave undefined to use the model configured in Codex. */
  model?: string;
}

const CONTRACT_ERROR = 'Codex returned an answer that does not match the CoachReport contract.';
const NOT_LOGGED_IN_ERROR =
  'Codex is not logged in on the server. Run `pnpm exec codex login` and try again.';

/**
 * Asks the local Codex agent (logged in with `codex login`, no API key) to assess a CV.
 * Codex is an agent that can run commands, so it is locked down: read-only sandbox,
 * an empty working directory, no network, no web search and no approval prompts.
 */
export class CodexCoachEngine implements CoachEngine {
  private readonly codex: CodexClient;
  private readonly timeoutMs: number;
  private readonly model: string | undefined;
  private readonly workingDirectory = mkdtempSync(join(tmpdir(), 'java-coach-codex-'));

  constructor({ codex, timeoutMs, model }: CodexCoachEngineOptions) {
    this.codex = codex;
    this.timeoutMs = timeoutMs;
    this.model = model;
  }

  async analyze(cvText: string): Promise<CoachReport> {
    const thread = this.codex.startThread({
      model: this.model,
      sandboxMode: 'read-only',
      approvalPolicy: 'never',
      networkAccessEnabled: false,
      webSearchMode: 'disabled',
      workingDirectory: this.workingDirectory,
      skipGitRepoCheck: true,
    });

    const signal = AbortSignal.timeout(this.timeoutMs);
    let answer: string;
    try {
      const turn = await thread.run(buildCoachPrompt(cvText), {
        outputSchema: coachReportJsonSchema,
        signal,
      });
      answer = turn.finalResponse;
    } catch (error) {
      if (signal.aborted) throw new CoachTimeoutError(this.timeoutMs);
      const reason = error instanceof Error ? error.message : String(error);
      if (reason.includes('401')) throw new CoachFailedError(NOT_LOGGED_IN_ERROR, { cause: error });
      throw new CoachFailedError(`Codex failed: ${reason}`, { cause: error });
    }

    return clampScores(parseReport(answer));
  }
}

function parseReport(answer: string): CoachReport {
  let json: unknown;
  try {
    json = JSON.parse(answer);
  } catch (error) {
    throw new CoachFailedError(CONTRACT_ERROR, { cause: error });
  }
  const parsed = coachReportSchema.safeParse(json);
  if (!parsed.success) throw new CoachFailedError(CONTRACT_ERROR, { cause: parsed.error });
  return parsed.data;
}

function clampScores(report: CoachReport): CoachReport {
  return {
    ...report,
    assessments: report.assessments.map((a) => ({
      ...a,
      score: Math.min(100, Math.max(0, a.score)),
    })),
  };
}
