import { parseGuidePages } from './guide-pages';

describe('parseGuidePages', () => {
  it('AC1: orders pages by number and derives slug and title', () => {
    const pages = parseGuidePages({
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

  it('AC1: puts a file without a number prefix last, with its file name as slug', () => {
    const pages = parseGuidePages({
      '/docs/guide/notes.md': '# Notes',
      '/docs/guide/01-overview.md': '# Overview',
    });

    expect(pages.map((p) => p.slug)).toEqual(['overview', 'notes']);
  });

  it('AC1: falls back to the slug when a page has no title', () => {
    const [page] = parseGuidePages({ '/docs/guide/03-data-flow.md': 'No heading here.' });

    expect(page?.title).toBe('data-flow');
  });
});
