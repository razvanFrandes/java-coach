import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { renderWithProviders } from '@/test/render';
import { routes } from './router';

describe('routes', () => {
  it('dashboard AC8: the Dashboard link opens the dashboard', async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(routes, { initialEntries: ['/upload'] });
    renderWithProviders(<RouterProvider router={router} />, { withRouter: false });

    await user.click(screen.getByRole('link', { name: 'Dashboard' }));

    expect(screen.getByRole('heading', { name: 'Welcome to Java Coach' })).toBeInTheDocument();
  });
});
