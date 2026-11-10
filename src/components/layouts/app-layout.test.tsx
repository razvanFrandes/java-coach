import { screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { renderWithProviders } from '@/testing/test-utils';
import { AppLayout } from './app-layout';

function renderLayout(route: string) {
  renderWithProviders(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="*" element={<p>Page content</p>} />
      </Route>
    </Routes>,
    { route },
  );
  return within(screen.getByRole('navigation', { name: 'Main' }));
}

describe('AppLayout', () => {
  it('links to every page (profile AC7, gaps AC5, learning path AC11, dashboard AC8)', () => {
    const nav = renderLayout('/');

    expect(
      nav.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['Dashboard', '/'],
      ['Upload CV', '/upload'],
      ['Profile', '/profile'],
      ['Gaps', '/gaps'],
      ['Learning path', '/path'],
      ['Docs', '/docs'],
    ]);
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('marks the current page, including nested docs pages', () => {
    const nav = renderLayout('/docs/testing');

    expect(nav.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });
});
