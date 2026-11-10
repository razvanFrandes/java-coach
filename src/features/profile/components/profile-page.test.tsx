import { screen } from '@testing-library/react';
import { sampleReport } from '@/test/fixtures/coach-report';
import { renderWithProviders } from '@/test/render';
import { ProfilePage } from './profile-page';

describe('ProfilePage', () => {
  it('AC8: invites the user to upload a CV when there is no report', () => {
    renderWithProviders(<ProfilePage />);

    expect(screen.getByText('No CV analysed yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upload your CV' })).toHaveAttribute('href', '/upload');
  });

  it('AC9/AC10: shows the summary and all nine areas', () => {
    renderWithProviders(<ProfilePage />, { report: sampleReport });

    expect(screen.getByRole('heading', { name: 'Your Java profile' })).toBeInTheDocument();
    expect(screen.getByText(sampleReport.summary)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(9);
    expect(screen.getByRole('article', { name: 'Concurrency' })).toHaveTextContent('Not shown');
  });
});
