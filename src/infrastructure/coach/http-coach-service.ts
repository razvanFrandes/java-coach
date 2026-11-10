import type { CoachService } from '@/domain/coach-service';
import type { CoachReport } from '@/domain/types';

/** Path of the analyse endpoint. The contract is documented in docs/api-contract.md. */
export const ANALYZE_PATH = '/api/coach/analyze';

interface AnalyzeResponse {
  report: CoachReport;
}

interface ErrorResponse {
  error?: { code?: string; message?: string };
}

/** Talks to the Node server (server/), which asks Codex and caches results in SQLite. */
export class HttpCoachService implements CoachService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = window.location.origin) {
    this.baseUrl = baseUrl;
  }

  async analyzeCv(cvText: string): Promise<CoachReport> {
    let response: Response;
    try {
      response = await fetch(new URL(ANALYZE_PATH, this.baseUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      });
    } catch {
      throw new Error('Could not reach the coach server.');
    }

    if (!response.ok) throw new Error(await readErrorMessage(response));

    const body = (await response.json()) as AnalyzeResponse;
    return body.report;
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `The coach server answered with status ${response.status}.`;
  try {
    const body = (await response.json()) as ErrorResponse;
    return body.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}
