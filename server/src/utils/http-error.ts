/**
 * An error that already knows how it should look in the HTTP response.
 * Throw it from a controller or service; middlewares/error-handler.ts sends it as
 * `{ error: { code, message } }` with this status. The message is shown to the user.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}
