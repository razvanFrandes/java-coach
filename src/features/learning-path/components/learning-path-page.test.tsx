import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sampleReport } from '@/test/fixtures/coach-report';
import { renderWithProviders } from '@/test/render';
import { LearningPathPage } from './learning-path-page';

describe('LearningPathPage', () => {
  it('AC9: shows the no-report notice without a report', () => {
    renderWithProviders(<LearningPathPage />);

    expect(screen.getByText('No CV analysed yet')).toBeInTheDocument();
  });

  it('AC10: lists the steps in path order', () => {
    renderWithProviders(<LearningPathPage />, { report: sampleReport });

    const list = screen.getByRole('list', { name: 'Learning path' });
    const titles = within(list)
      .getAllByRole('heading')
      .map((h) => h.textContent);
    expect(titles).toEqual([
      'Threads and executors',
      'Asynchronous Java',
      'Memory and garbage collection',
      'Choosing the right collection',
      'Test-driven development',
    ]);
  });

  it('AC11: ticking a step updates the progress', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LearningPathPage />, { report: sampleReport });
    expect(screen.getByText('0 of 5 steps done')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Mark Threads and executors as done' }));

    expect(screen.getByText('1 of 5 steps done')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Learning path progress' })).toHaveAttribute(
      'aria-valuenow',
      '20',
    );
  });

  it('AC12: says so when there are no steps', () => {
    renderWithProviders(<LearningPathPage />, { report: { ...sampleReport, steps: [] } });

    expect(
      screen.getByText('No steps needed. Every area is already advanced.'),
    ).toBeInTheDocument();
  });
});
