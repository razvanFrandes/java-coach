import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

/** Reads every page of a PDF in the browser and returns its text, one line per text row. */
export async function extractPdfText(file: File): Promise<string> {
  // pdf.js is large, so it is loaded on the first upload instead of with the app.
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  // Text extraction needs no fonts, so only real errors are logged.
  const loadingTask = pdfjs.getDocument({ data, verbosity: pdfjs.VerbosityLevel.ERRORS });
  try {
    const document = await loadingTask.promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : ''))
        .join('');
      pages.push(text);
    }
    return pages
      .join('\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .trim();
  } finally {
    await loadingTask.destroy();
  }
}
