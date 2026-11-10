/** The coach could not produce a valid report. The message is shown to the user. */
export class CoachFailedError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'CoachFailedError';
  }
}

/** The coach did not answer in time. */
export class CoachTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Codex did not answer within ${timeoutMs / 1000} seconds.`);
    this.name = 'CoachTimeoutError';
  }
}
