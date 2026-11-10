import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { renderWithProviders } from '@/testing/test-utils';
import { routes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  renderWithProviders(<RouterProvider router={router} />, { withRouter: false });
  return router;
}

describe('router', () => {
  it.each([
    ['/', 'Welcome to Java Coach'],
    ['/upload', 'Upload your CV'],
    ['/profile', 'No CV analysed yet'],
    ['/gaps', 'No CV analysed yet'],
    ['/path', 'No CV analysed yet'],
  ])('opens %s', async (path, text) => {
    renderAt(path);

    expect((await screen.findAllByText(text))[0]).toBeInTheDocument();
  });

  it('docs AC3: /docs opens the first guide page', async () => {
    const router = renderAt('/docs');

    expect(await screen.findByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/docs/overview');
  });
});
