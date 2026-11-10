/** Rules a CV must pass before the coach sees it. */

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
export const MIN_CV_TEXT_CHARACTERS = 50;

export type CvProblem = 'not-pdf' | 'empty-file' | 'too-large' | 'no-text';

/** The parts of a browser File these rules need. A real File fits this shape. */
export interface CvFileInfo {
  name: string;
  type: string;
  size: number;
}

export function validateCvFile(file: CvFileInfo): CvProblem | null {
  if (!isPdf(file)) return 'not-pdf';
  if (file.size === 0) return 'empty-file';
  if (file.size > MAX_CV_SIZE_BYTES) return 'too-large';
  return null;
}

/** Scanned CVs are images: pdf.js finds (almost) no text in them. */
export function validateCvText(text: string): CvProblem | null {
  const visibleCharacters = text.replace(/\s/g, '').length;
  return visibleCharacters < MIN_CV_TEXT_CHARACTERS ? 'no-text' : null;
}

function isPdf({ name, type }: CvFileInfo): boolean {
  // Some systems report no media type at all; then the extension is all we have.
  if (type === '') return name.toLowerCase().endsWith('.pdf');
  return type === 'application/pdf';
}
