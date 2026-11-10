import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { renderWithProviders } from '@/test/render';
import { AppLayout } from './app-layout';

describe('AppLayout', () => {
  it('shows the main navigation and the current page', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<p>home page</p>} />
        </Route>
      </Routes>,
    );

    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Dashboard');
    expect(nav).toHaveTextContent('Upload CV');
    expect(nav).toHaveTextContent('Profile'); // profile-summary AC12
    expect(nav).toHaveTextContent('Gaps'); // gap-analysis AC10
    expect(nav).toHaveTextContent('Learning path'); // learning-path AC13
    expect(nav).toHaveTextContent('Docs');
    expect(screen.getByText('home page')).toBeInTheDocument();
  });
});
