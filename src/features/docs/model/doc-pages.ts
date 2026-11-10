export interface DocPage {
  slug: string;
  title: string;
  content: string;
}

/**
 * Turns `{ '/docs/guide/01-overview.md': '# Overview ...' }` into ordered pages.
 * The number prefix sets the order and is dropped from the slug.
 */
export function parseDocPages(files: Record<string, string>): DocPage[] {
  return Object.entries(files)
    .map(([path, content]) => {
      const fileName = path.split('/').at(-1) ?? path;
      const match = /^(\d+)-(.+)\.md$/.exec(fileName);
      const order = Number(match?.[1] ?? Number.MAX_SAFE_INTEGER);
      const slug = match?.[2] ?? fileName.replace(/\.md$/, '');
      const title = /^# (.+)$/m.exec(content)?.[1]?.trim() ?? slug;
      return { order, page: { slug, title, content } };
    })
    .sort((a, b) => a.order - b.order)
    .map(({ page }) => page);
}
