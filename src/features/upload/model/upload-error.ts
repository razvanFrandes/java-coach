import type { CvProblem } from '@/domain/cv-file-rules';

export type UploadProblem = CvProblem | 'unreadable-pdf' | 'coach-failed';

const MESSAGES: Record<Exclude<UploadProblem, 'coach-failed'>, string> = {
  'not-pdf': 'Only PDF files are supported.',
  'too-large': 'This file is larger than 5 MB.',
  'empty-file': 'This file is empty.',
  'unreadable-pdf': 'We could not read this PDF. It may be damaged or password-protected.',
  'no-text':
    'We could not find any text in this PDF. Is it a scanned image? Export your CV as a text PDF and try again.',
};

/** An upload failure the user can understand. `message` is ready to show on screen. */
export class UploadError extends Error {
  readonly problem: UploadProblem;

  constructor(problem: UploadProblem, cause?: unknown) {
    super(
      problem === 'coach-failed'
        ? `The coach could not analyse your CV: ${cause instanceof Error ? cause.message : 'unknown error'}`
        : MESSAGES[problem],
      { cause },
    );
    this.name = 'UploadError';
    this.problem = problem;
  }
}
