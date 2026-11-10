import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sampleReport } from '@/test/fixtures/coach-report';
import { renderWithProviders } from '@/test/render';
import { NextStepCard } from './next-step-card';

const threads = sampleReport.steps.find((s) => s.id === 'concurrency-1');

describe('NextStepCard', () => {
  it('AC5: shows the next step and reports "Mark as done"', async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    renderWithProviders(<NextStepCard step={threads} hasSteps onDone={onDone} />);

    expect(screen.getByRole('heading', { name: 'Threads and executors' })).toBeInTheDocument();
    expect(screen.getByText('Run work in parallel safely.')).toBeInTheDocument();
    expect(screen.getByText('6 h')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mark as done' }));
    expect(onDone).toHaveBeenCalledWith('concurrency-1');
  });

  it('AC6: congratulates when every step is done', () => {
    renderWithProviders(<NextStepCard step={undefined} hasSteps onDone={vi.fn()} />);

    expect(screen.getByText('You have finished every step.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark as done' })).not.toBeInTheDocument();
  });

  it('AC6: says no steps are needed for an empty path', () => {
    renderWithProviders(<NextStepCard step={undefined} hasSteps={false} onDone={vi.fn()} />);

    expect(screen.getByText('No steps needed.')).toBeInTheDocument();
  });
});
