import { parseDocPages } from '../model/doc-pages';

/**
 * The guides in docs/guide, bundled into the app at build time by Vite (`?raw` = file text).
 * Edit the markdown files; the app picks them up on the next reload.
 */
const files = import.meta.glob<string>('/docs/guide/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const guidePages = parseDocPages(files);
