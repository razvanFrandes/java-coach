import { PROGRESS_STORAGE_KEY, useProgressStore } from './progress-store';

describe('useProgressStore', () => {
  it('AC1: toggleStep marks a step done, and not done when toggled again', () => {
    const { toggleStep } = useProgressStore.getState();

    toggleStep('jvm-1');
    expect(useProgressStore.getState().completedStepIds).toEqual(['jvm-1']);

    toggleStep('jvm-1');
    expect(useProgressStore.getState().completedStepIds).toEqual([]);
  });

  it('AC2: saves the completed ids in localStorage', () => {
    useProgressStore.getState().toggleStep('concurrency-1');

    const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) ?? '{}');
    expect(PROGRESS_STORAGE_KEY).toBe('java-coach:learning-progress');
    expect(saved.state).toEqual({ completedStepIds: ['concurrency-1'] });
  });

  it('AC2: restores the completed ids when the app loads', async () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ state: { completedStepIds: ['jvm-1', 'testing-1'] }, version: 0 }),
    );

    await useProgressStore.persist.rehydrate();

    expect(useProgressStore.getState().completedStepIds).toEqual(['jvm-1', 'testing-1']);
  });
});
