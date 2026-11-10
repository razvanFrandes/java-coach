import type { ApiErrorResponse } from '@/types/api';

/**
 * Every call to our server goes through here: JSON in, JSON out.
 * On failure it throws an Error whose message can be shown to the user.
 */
export async function apiPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(new URL(path, window.location.origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the coach server.');
  }

  if (!response.ok) throw new Error(await readErrorMessage(response));
  return (await response.json()) as TResponse;
}

/** The server sends `{ error: { code, message } }` (docs/api-contract.md). */
async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `The server answered with status ${response.status}.`;
  try {
    const body = (await response.json()) as Partial<ApiErrorResponse>;
    return body.error?.message ?? fallback;
  } catch {
    return fallback;
  }
}
