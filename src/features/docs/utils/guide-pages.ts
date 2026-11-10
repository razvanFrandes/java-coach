export interface GuidePage {
  slug: string;
  title: string;
  content: string;
}

/**
 * Turns `{ '/docs/guide/01-overview.md': '# Overview ...' }` into ordered pages.
 * The number prefix sets the order and is dropped from the slug.
 */
export function parseGuidePages(files: Record<string, string>): GuidePage[] {
  return Object.entries(files)
    .map(([path, content]) => {
      const fileName = path.slice(path.lastIndexOf('/') + 1);
      const match = /^(\d+)-(.+)\.md$/.exec(fileName);
      const order = Number(match?.[1] ?? Number.MAX_SAFE_INTEGER);
      const slug = match?.[2] ?? fileName.replace(/\.md$/, '');
      const title = /^# (.+)$/m.exec(content)?.[1]?.trim() ?? slug;
      return { order, page: { slug, title, content } };
    })
    .sort((a, b) => a.order - b.order)
    .map(({ page }) => page);
}

/**
 * The guides in docs/guide, bundled into the app by Vite (`?raw` = the file's text).
 * Edit the markdown files; the app picks them up on the next reload.
 */
export const guidePages = parseGuidePages(
  import.meta.glob<string>('/docs/guide/*.md', { query: '?raw', import: 'default', eager: true }),
);
