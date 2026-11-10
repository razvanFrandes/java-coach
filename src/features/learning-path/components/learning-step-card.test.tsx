import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LearningStep } from '@/domain/types';
import { sampleReport } from '@/test/fixtures/coach-report';
import { renderWithProviders } from '@/test/render';
import { LearningStepCard } from './learning-step-card';

function fixtureStep(id: string): LearningStep {
  const step = sampleReport.steps.find((s) => s.id === id);
  if (!step) throw new Error(`sampleReport must contain step ${id}`);
  return step;
}

const asyncStep = fixtureStep('concurrency-2'); // "Asynchronous Java", after "Threads and executors"

function renderCard(done: boolean, onToggle = vi.fn()) {
  renderWithProviders(
    <ol>
      <LearningStepCard
        position={2}
        step={asyncStep}
        done={done}
        prerequisiteTitles={['Threads and executors']}
        onToggle={onToggle}
      />
    </ol>,
  );
  return onToggle;
}

describe('LearningStepCard', () => {
  it('AC10: shows everything the user needs to do the step', () => {
    renderCard(false);

    const card = screen.getByRole('listitem', { name: 'Asynchronous Java' });
    expect(within(card).getByRole('heading', { name: 'Asynchronous Java' })).toBeInTheDocument();
    expect(card).toHaveTextContent('Concurrency');
    expect(card).toHaveTextContent(asyncStep.goal);
    expect(card).toHaveTextContent('CompletableFuture');
    expect(card).toHaveTextContent(asyncStep.exercise);
    expect(card).toHaveTextContent('8 h');
    expect(card).toHaveTextContent('After: Threads and executors');
  });

  it('AC11: reports a click on its checkbox', async () => {
    const user = userEvent.setup();
    const onToggle = renderCard(false);

    await user.click(screen.getByRole('checkbox', { name: 'Mark Asynchronous Java as done' }));

    expect(onToggle).toHaveBeenCalledWith('concurrency-2');
  });

  it('AC11: shows a completed step as checked', () => {
    renderCard(true);

    expect(screen.getByRole('checkbox', { name: 'Mark Asynchronous Java as done' })).toBeChecked();
  });
});
