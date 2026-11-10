import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CoachReport } from '@/domain/types';
import { sampleReport } from '@/test/fixtures/coach-report';
import { renderWithProviders } from '@/test/render';
import { DashboardPage } from './dashboard-page';

function section(name: string) {
  return screen.getByRole('region', { name });
}

describe('DashboardPage', () => {
  it('AC1: welcomes a new user and points to the upload and the sample CV', () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole('heading', { name: 'Welcome to Java Coach' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upload your CV' })).toHaveAttribute('href', '/upload');
    expect(screen.getByRole('link', { name: 'Download a sample CV' })).toHaveAttribute(
      'href',
      '/sample-cv.pdf',
    );
  });

  it('AC2: shows the skill levels', () => {
    renderWithProviders(<DashboardPage />, { report: sampleReport });

    expect(within(section('Skill levels')).getAllByRole('progressbar')).toHaveLength(9);
  });

  it('AC3: counts the gaps and links to them', () => {
    renderWithProviders(<DashboardPage />, { report: sampleReport });

    const gaps = section('Gaps');
    expect(gaps).toHaveTextContent('4 gaps to work on');
    expect(within(gaps).getByRole('link', { name: 'See all gaps' })).toHaveAttribute(
      'href',
      '/gaps',
    );
  });

  it.each([
    [['concurrency'], '1 gap to work on'],
    [[], 'No gaps'],
  ])('AC3: words the gap count for %o', (weakAreas, text) => {
    const report: CoachReport = {
      ...sampleReport,
      assessments: sampleReport.assessments.map((a) => ({
        ...a,
        score: weakAreas.includes(a.area) ? 0 : 70,
      })),
    };
    renderWithProviders(<DashboardPage />, { report });

    expect(section('Gaps')).toHaveTextContent(text);
  });

  it('AC4/AC5: shows path progress and completes the next step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />, { report: sampleReport });
    const path = section('Learning path');
    expect(path).toHaveTextContent('0 of 5 steps done');
    expect(path).toHaveTextContent('29 h to go');
    expect(within(path).getByRole('link', { name: 'Open learning path' })).toHaveAttribute(
      'href',
      '/path',
    );

    const next = section('Next step');
    expect(
      within(next).getByRole('heading', { name: 'Threads and executors' }),
    ).toBeInTheDocument();

    await user.click(within(next).getByRole('button', { name: 'Mark as done' }));

    expect(within(next).getByRole('heading', { name: 'Asynchronous Java' })).toBeInTheDocument();
    expect(path).toHaveTextContent('1 of 5 steps done');
  });

  it('AC7: offers to analyse another CV', () => {
    renderWithProviders(<DashboardPage />, { report: sampleReport });

    expect(screen.getByRole('link', { name: 'Analyse another CV' })).toHaveAttribute(
      'href',
      '/upload',
    );
  });
});
