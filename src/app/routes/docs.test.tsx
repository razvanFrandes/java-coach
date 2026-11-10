import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { renderWithProviders } from '@/testing/test-utils';
import { DocsRoute } from './docs';

function renderDocs(route: string) {
  renderWithProviders(
    <Routes>
      <Route path="/docs/:slug" element={<DocsRoute />} />
    </Routes>,
    { route },
  );
}

describe('DocsRoute', () => {
  it('AC2: lists the guide pages in order', () => {
    renderDocs('/docs/overview');

    const nav = within(screen.getByRole('navigation', { name: 'Docs' }));
    expect(nav.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Overview',
      'Project structure',
      'Data flow',
      'State',
      'Backend',
      'Testing',
      'Agent setup',
    ]);
  });

  it('AC4/AC5: renders the page markdown and marks it as current', () => {
    renderDocs('/docs/testing');

    expect(screen.getByRole('heading', { level: 1, name: 'Testing' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: 'Docs' })).getByRole('link', {
        name: 'Testing',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('AC6: shows "Page not found" for an unknown slug', () => {
    renderDocs('/docs/nope');

    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the overview' })).toHaveAttribute(
      'href',
      '/docs/overview',
    );
  });

  it('AC7: links to other guide pages navigate inside the app', async () => {
    const user = userEvent.setup();
    renderDocs('/docs/overview');

    const article = within(screen.getByRole('article'));
    await user.click(article.getAllByRole('link', { name: 'Project structure' })[0] as HTMLElement);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Project structure' }),
    ).toBeInTheDocument();
  });
});
