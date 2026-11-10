import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigate, Route, Routes } from 'react-router';
import { renderWithProviders } from '@/test/render';
import { DocsPage } from './docs-page';

vi.mock('mermaid', () => ({
  default: { initialize: vi.fn(), render: vi.fn(() => Promise.resolve({ svg: '<svg></svg>' })) },
}));

function renderDocs(route: string) {
  renderWithProviders(
    <Routes>
      <Route path="/docs" element={<Navigate to="/docs/overview" replace />} />
      <Route path="/docs/:slug" element={<DocsPage />} />
    </Routes>,
    { route },
  );
}

const sidebar = () => screen.getByRole('navigation', { name: 'Docs' });

describe('DocsPage', () => {
  it('AC2: lists the seven guide pages in order', () => {
    renderDocs('/docs/overview');

    expect(
      within(sidebar())
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual([
      'Overview',
      'Architecture',
      'Data flow',
      'State',
      'SOLID in this codebase',
      'Testing',
      'Agent setup',
    ]);
  });

  it('AC3/AC4: /docs opens the overview and renders its markdown', () => {
    renderDocs('/docs');

    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveTextContent('pnpm dev');
  });

  it('AC5: marks the current page in the sidebar', () => {
    renderDocs('/docs/state');

    expect(within(sidebar()).getByRole('link', { name: 'State' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('AC5: moves to another page from the sidebar', async () => {
    const user = userEvent.setup();
    renderDocs('/docs/overview');

    await user.click(within(sidebar()).getByRole('link', { name: 'Testing' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Testing' })).toBeInTheDocument();
  });

  it('AC6: says when a page does not exist', () => {
    renderDocs('/docs/nope');

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the overview' })).toHaveAttribute(
      'href',
      '/docs/overview',
    );
  });

  it('AC7: follows links between doc pages inside the app', async () => {
    const user = userEvent.setup();
    renderDocs('/docs/overview');

    const article = screen.getByRole('article');
    await user.click(within(article).getByRole('link', { name: 'the architecture page' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Architecture' })).toBeInTheDocument();
  });

  it('AC8: renders mermaid blocks as diagrams', async () => {
    renderDocs('/docs/architecture');

    expect(await screen.findAllByRole('figure', { name: 'Diagram' })).not.toHaveLength(0);
  });
});
