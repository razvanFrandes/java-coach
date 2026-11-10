/**
 * Runs one CV through Codex from the command line, without the web app or the database.
 * Handy to check that `codex login` works and to see what the coach answers.
 *
 *   pnpm codex:try                      # uses public/sample-cv.pdf
 *   pnpm codex:try path/to/cv.pdf       # or a .txt file
 */
import { readFileSync } from 'node:fs';
import { Codex } from '@openai/codex-sdk';
import { getDocument, VerbosityLevel } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { CodexCoachEngine } from '../server/src/infrastructure/codex-coach-engine';

async function readCvText(path: string): Promise<string> {
  if (!path.toLowerCase().endsWith('.pdf')) return readFileSync(path, 'utf8');

  const data = new Uint8Array(readFileSync(path));
  const document = await getDocument({ data, verbosity: VerbosityLevel.ERRORS }).promise;
  const lines: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const content = await (await document.getPage(pageNumber)).getTextContent();
    lines.push(content.items.map((item) => ('str' in item ? item.str : '')).join('\n'));
  }
  return lines.join('\n');
}

const path = process.argv[2] ?? 'public/sample-cv.pdf';
const cvText = await readCvText(path);
console.info(`Asking Codex about ${path} (${cvText.length} characters). This can take a minute...`);

const started = Date.now();
const engine = new CodexCoachEngine({ codex: new Codex(), timeoutMs: 180_000 });
try {
  const report = await engine.analyze(cvText);
  console.info(JSON.stringify(report, null, 2));
  console.info(`Done in ${Math.round((Date.now() - started) / 1000)} s.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
