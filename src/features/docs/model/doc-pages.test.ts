import { parseDocPages } from './doc-pages';

describe('parseDocPages', () => {
  it('AC1: orders pages by number and derives slug and title', () => {
    const pages = parseDocPages({
      '/docs/guide/02-architecture.md': '# Architecture\n\nLayers.',
      '/docs/guide/10-agent-setup.md': '# Agent setup\n',
      '/docs/guide/01-overview.md': 'Intro line\n# Overview\n\nWhat it does.',
    });

    expect(pages.map((p) => [p.slug, p.title])).toEqual([
      ['overview', 'Overview'],
      ['architecture', 'Architecture'],
      ['agent-setup', 'Agent setup'],
    ]);
    expect(pages[1]?.content).toBe('# Architecture\n\nLayers.');
  });

  it('AC1: falls back to the slug when a page has no title', () => {
    const [page] = parseDocPages({ '/docs/guide/03-data-flow.md': 'No heading here.' });

    expect(page?.title).toBe('data-flow');
  });
});
