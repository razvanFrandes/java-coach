// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Keeps the guides honest: a code block that starts with a file path comment must match that
 * file. Chunks between "// ..." lines are checked separately, so a snippet may skip lines.
 */
const ROOT = join(import.meta.dirname, '../../..');
const GUIDE_DIR = join(ROOT, 'docs/guide');

interface Snippet {
  guide: string;
  file: string;
  chunks: string[];
}

function collectSnippets(): Snippet[] {
  const snippets: Snippet[] = [];
  for (const guide of readdirSync(GUIDE_DIR).filter((name) => name.endsWith('.md'))) {
    const markdown = readFileSync(join(GUIDE_DIR, guide), 'utf8');
    for (const match of markdown.matchAll(/```(?:ts|tsx|js)\n([\s\S]*?)```/g)) {
      const [firstLine = '', ...rest] = (match[1] ?? '').split('\n');
      const path = /^\/\/ ([\w./-]+\.(?:ts|tsx|js))$/.exec(firstLine.trim())?.[1];
      if (!path || rest.some((line) => line.includes('// counterexample'))) continue;

      const chunks = rest
        .join('\n')
        .split(/^\s*\/\/ \.\.\.\s*$/m)
        .map((chunk) => chunk.replace(/^\n+|\s+$/g, ''))
        .filter((chunk) => chunk.length > 0);
      snippets.push({ guide, file: path, chunks });
    }
  }
  return snippets;
}

const snippets = collectSnippets();

describe('docs snippets', () => {
  it('AC9: all seven guide pages exist', () => {
    expect(readdirSync(GUIDE_DIR).filter((name) => name.endsWith('.md'))).toHaveLength(7);
  });

  it('AC9: the guides contain at least ten checked snippets', () => {
    expect(snippets.length).toBeGreaterThanOrEqual(10);
  });

  it.each(snippets.map((s) => [`${s.guide} -> ${s.file}`, s] as const))(
    'AC8: %s matches the source',
    (_name, snippet) => {
      const source = readFileSync(join(ROOT, snippet.file), 'utf8');
      for (const chunk of snippet.chunks) {
        expect(source, `chunk not found in ${snippet.file}:\n${chunk}`).toContain(chunk);
      }
    },
  );
});
