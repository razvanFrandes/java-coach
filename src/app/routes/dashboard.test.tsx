import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sampleReport } from '@/mocks/data/coach-report';
import { useProgressStore } from '@/features/learning-path/stores/progress-store';
import { renderWithProviders } from '@/testing/test-utils';
import { DashboardRoute } from './dashboard';

describe('DashboardRoute', () => {
  it('AC1: without a report, welcomes the user and offers upload and a sample CV', () => {
    renderWithProviders(<DashboardRoute />);

    expect(screen.getByText('Welcome to Java Coach')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upload your CV' })).toHaveAttribute('href', '/upload');
    expect(screen.getByRole('link', { name: 'Download a sample CV' })).toHaveAttribute(
      'href',
      '/sample-cv.pdf',
    );
  });

  it('AC2: shows a table with every area, its score bar and level', () => {
    renderWithProviders(<DashboardRoute />, { report: sampleReport });

    const table = screen.getByRole('table', { name: 'Skill levels' });
    const rows = within(table).getAllByRole('row').slice(1); // skip the header row
    expect(rows).toHaveLength(9);
    expect(within(rows[0] as HTMLElement).getByText('Core language')).toBeInTheDocument();
    expect(
      within(rows[0] as HTMLElement).getByRole('progressbar', { name: 'Core language score' }),
    ).toBeInTheDocument();
    expect(within(rows[0] as HTMLElement).getByText('Intermediate')).toBeInTheDocument();
  });

  it.each([
    [sampleReport.gaps, '4 gaps to work on'],
    [sampleReport.gaps.slice(0, 1), '1 gap to work on'],
    [[], 'No gaps'],
  ])('AC3: counts the gaps (%#) and links to /gaps', (gaps, text) => {
    renderWithProviders(<DashboardRoute />, { report: { ...sampleReport, gaps } });

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all gaps' })).toHaveAttribute('href', '/gaps');
  });

  it('AC4: shows the path progress and links to /path', () => {
    useProgressStore.getState().toggleStep('jvm-1');
    renderWithProviders(<DashboardRoute />, { report: sampleReport });

    expect(screen.getByText('1 of 5 steps done')).toBeInTheDocument();
    expect(screen.getByText('24 h to go')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open learning path' })).toHaveAttribute(
      'href',
      '/path',
    );
  });

  it('AC5: shows the next step, and "Mark as done" moves on to the following one', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardRoute />, { report: sampleReport });

    expect(screen.getByText('Threads and executors')).toBeInTheDocument();
    expect(screen.getByText('Run work in parallel safely.')).toBeInTheDocument();
    expect(screen.getByText('6 h')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mark as done' }));

    expect(screen.getByText('Asynchronous Java')).toBeInTheDocument();
    expect(screen.queryByText('Threads and executors')).not.toBeInTheDocument();
  });

  it('AC6: says when every step is done, or when there are no steps', () => {
    for (const step of sampleReport.learningPath) useProgressStore.getState().toggleStep(step.id);
    const { unmount } = renderWithProviders(<DashboardRoute />, { report: sampleReport });
    expect(screen.getByText('You have finished every step.')).toBeInTheDocument();
    unmount();

    renderWithProviders(<DashboardRoute />, { report: { ...sampleReport, learningPath: [] } });
    expect(screen.getByText('No steps needed.')).toBeInTheDocument();
  });

  it('AC7: offers to analyse another CV', () => {
    renderWithProviders(<DashboardRoute />, { report: sampleReport });

    expect(screen.getByRole('link', { name: 'Analyse another CV' })).toHaveAttribute(
      'href',
      '/upload',
    );
  });
});
