import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sampleReport } from '@/mocks/data/coach-report';
import { renderWithProviders } from '@/testing/test-utils';
import { LearningPathRoute } from './learning-path';

describe('LearningPathRoute', () => {
  it('AC7: without a report, shows the "No CV analysed yet" notice', () => {
    renderWithProviders(<LearningPathRoute />);

    expect(screen.getByText('No CV analysed yet')).toBeInTheDocument();
  });

  it('AC8: shows the steps as a numbered list with all their details', () => {
    renderWithProviders(<LearningPathRoute />, { report: sampleReport });

    const list = screen.getByRole('list', { name: 'Learning path' });
    expect(list.tagName).toBe('OL');
    const steps = within(list).getAllByRole('listitem', { name: /.+/ });
    expect(steps.map((s) => s.getAttribute('aria-label'))).toEqual([
      'Threads and executors',
      'Asynchronous Java',
      'Memory and garbage collection',
      'Choosing the right collection',
      'Test-driven development',
    ]);

    const asyncJava = within(steps[1] as HTMLElement);
    expect(asyncJava.getByText('2')).toBeInTheDocument();
    expect(asyncJava.getByText('Concurrency')).toBeInTheDocument();
    expect(
      asyncJava.getByText('Compose asynchronous work without blocking threads.'),
    ).toBeInTheDocument();
    expect(asyncJava.getByText('CompletableFuture')).toBeInTheDocument();
    expect(
      asyncJava.getByText('Call three slow services in parallel and combine their answers.'),
    ).toBeInTheDocument();
    expect(asyncJava.getByText('8 h')).toBeInTheDocument();
    expect(asyncJava.getByText('After: Threads and executors')).toBeInTheDocument();
  });

  it('AC9: ticking a step updates the progress', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LearningPathRoute />, { report: sampleReport });
    expect(screen.getByText('0 of 5 steps done')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Mark Threads and executors as done' }));

    expect(screen.getByText('1 of 5 steps done')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Mark Threads and executors as done' }),
    ).toBeChecked();
  });

  it('AC10: says when no steps are needed', () => {
    renderWithProviders(<LearningPathRoute />, { report: { ...sampleReport, learningPath: [] } });

    expect(
      screen.getByText('No steps needed. Every area is already advanced.'),
    ).toBeInTheDocument();
  });
});
