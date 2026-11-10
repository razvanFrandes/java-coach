// @vitest-environment node
import { readFileSync } from 'node:fs';
import { extractPdfText } from './extract-pdf-text';

// pdfjs needs a Web Worker in the browser. In Node we swap in its "legacy" build,
// which parses in-process. The code under test is unchanged.
vi.mock('pdfjs-dist', () => import('pdfjs-dist/legacy/build/pdf.mjs'));
vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({
  default: 'pdfjs-dist/legacy/build/pdf.worker.mjs',
}));

function fixtureFile(name: string): File {
  const bytes = readFileSync(new URL(`../testing/fixtures/${name}`, import.meta.url));
  return new File([bytes], name, { type: 'application/pdf' });
}

describe('extractPdfText', () => {
  it('AC8: returns the text of a real PDF, line by line', async () => {
    const text = await extractPdfText(fixtureFile('sample-cv.pdf'));

    expect(text).toContain('Ana Popescu - Junior Java Developer');
    expect(text).toContain('Built REST APIs with Spring Boot and Spring Data JPA on Java 17');
    expect(text.split('\n').length).toBeGreaterThan(5);
  });

  it('AC8: rejects a file that is not a valid PDF', async () => {
    const notAPdf = new File(['hello'], 'cv.pdf', { type: 'application/pdf' });

    await expect(extractPdfText(notAPdf)).rejects.toThrow();
  });
});
