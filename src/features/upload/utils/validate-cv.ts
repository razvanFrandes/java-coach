const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_TEXT_CHARACTERS = 50;

/** Checks the file before we read it. Returns the message to show, or null when it is fine. */
export function getCvFileError(file: File): string | null {
  // Some systems give no media type at all; then the file name is all we have.
  const isPdf =
    file.type === 'application/pdf' ||
    (file.type === '' && file.name.toLowerCase().endsWith('.pdf'));

  if (!isPdf) return 'Only PDF files are supported.';
  if (file.size === 0) return 'This file is empty.';
  if (file.size > MAX_SIZE_BYTES) return 'This file is larger than 5 MB.';
  return null;
}

/** Scanned CVs are images, so (almost) no text comes out of them. */
export function getCvTextError(text: string): string | null {
  const visibleCharacters = text.replace(/\s/g, '').length;
  if (visibleCharacters < MIN_TEXT_CHARACTERS) {
    return 'We could not find any text in this PDF. Is it a scanned image? Export your CV as a text PDF and try again.';
  }
  return null;
}
