import { MAX_CV_SIZE_BYTES, validateCvFile, validateCvText } from './cv-file-rules';

const pdf = { name: 'cv.pdf', type: 'application/pdf', size: 2048 };

describe('validateCvFile', () => {
  it('AC1: accepts a file with the PDF media type', () => {
    expect(validateCvFile(pdf)).toBeNull();
  });

  it('AC1: accepts a .pdf name when the browser gives no media type', () => {
    expect(validateCvFile({ ...pdf, name: 'CV.PDF', type: '' })).toBeNull();
  });

  it('AC1: rejects other media types, even with a .pdf name', () => {
    expect(validateCvFile({ ...pdf, name: 'cv.pdf', type: 'image/png' })).toBe('not-pdf');
    expect(validateCvFile({ ...pdf, name: 'cv.docx', type: '' })).toBe('not-pdf');
  });

  it('AC2: rejects an empty file', () => {
    expect(validateCvFile({ ...pdf, size: 0 })).toBe('empty-file');
  });

  it('AC3: accepts exactly 5 MB and rejects one byte more', () => {
    expect(MAX_CV_SIZE_BYTES).toBe(5 * 1024 * 1024);
    expect(validateCvFile({ ...pdf, size: MAX_CV_SIZE_BYTES })).toBeNull();
    expect(validateCvFile({ ...pdf, size: MAX_CV_SIZE_BYTES + 1 })).toBe('too-large');
  });
});

describe('validateCvText', () => {
  it('AC4: rejects text with fewer than 50 non-whitespace characters', () => {
    expect(validateCvText('   \n  Java   developer \n')).toBe('no-text');
    expect(validateCvText(`${'a'.repeat(25)}   ${'b'.repeat(24)}`)).toBe('no-text');
  });

  it('AC4: accepts text with at least 50 non-whitespace characters', () => {
    expect(validateCvText(`${'a'.repeat(25)}   ${'b'.repeat(25)}`)).toBeNull();
  });
});
