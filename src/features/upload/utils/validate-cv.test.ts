import { makeFile } from '@/testing/fixtures/files';
import { getCvFileError, getCvTextError } from './validate-cv';

const FIVE_MB = 5 * 1024 * 1024;

describe('getCvFileError', () => {
  it('AC1: accepts a PDF by its type', () => {
    expect(getCvFileError(makeFile({ type: 'application/pdf' }))).toBeNull();
  });

  it('AC1: accepts a file without a type when the name ends with .pdf, in any case', () => {
    expect(getCvFileError(makeFile({ name: 'CV.PDF', type: '' }))).toBeNull();
  });

  it.each([
    ['a Word file', makeFile({ name: 'cv.docx', type: 'application/msword' })],
    ['a file without a type and without .pdf', makeFile({ name: 'cv', type: '' })],
    ['a .pdf name with another type', makeFile({ name: 'cv.pdf', type: 'image/png' })],
  ])('AC1: refuses %s', (_name, file) => {
    expect(getCvFileError(file)).toBe('Only PDF files are supported.');
  });

  it('AC2: refuses an empty file', () => {
    expect(getCvFileError(makeFile({ sizeBytes: 0 }))).toBe('This file is empty.');
  });

  it('AC3: accepts exactly 5 MB and refuses one byte more', () => {
    expect(getCvFileError(makeFile({ sizeBytes: FIVE_MB }))).toBeNull();
    expect(getCvFileError(makeFile({ sizeBytes: FIVE_MB + 1 }))).toBe(
      'This file is larger than 5 MB.',
    );
  });
});

describe('getCvTextError', () => {
  const NO_TEXT =
    'We could not find any text in this PDF. Is it a scanned image? Export your CV as a text PDF and try again.';

  it('AC4: refuses text with fewer than 50 visible characters, ignoring whitespace', () => {
    expect(getCvTextError('')).toBe(NO_TEXT);
    expect(getCvTextError(`${'a '.repeat(49)}\n\n\t`)).toBe(NO_TEXT);
  });

  it('AC4: accepts 50 visible characters', () => {
    expect(getCvTextError('a'.repeat(50))).toBeNull();
  });
});
