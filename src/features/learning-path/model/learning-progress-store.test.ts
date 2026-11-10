import { LEARNING_PROGRESS_STORAGE_KEY, useLearningProgressStore } from './learning-progress-store';

const store = () => useLearningProgressStore.getState();

describe('learning progress store', () => {
  it('AC7: toggling marks a step done, toggling again marks it not done', () => {
    store().toggleStep('jvm-1');
    expect(store().completedStepIds).toEqual(['jvm-1']);

    store().toggleStep('jvm-1');
    expect(store().completedStepIds).toEqual([]);
  });

  it('AC8: saves completed steps in localStorage', () => {
    store().toggleStep('jvm-1');

    expect(localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY)).toContain('jvm-1');
  });

  it('AC8: restores completed steps when the app loads again', async () => {
    store().toggleStep('jvm-1');
    const saved = localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY);

    // Simulate a reload: forget the in-memory state, keep localStorage, rehydrate.
    useLearningProgressStore.setState({ completedStepIds: [] });
    localStorage.setItem(LEARNING_PROGRESS_STORAGE_KEY, saved ?? '');
    await useLearningProgressStore.persist.rehydrate();

    expect(store().completedStepIds).toEqual(['jvm-1']);
  });
});
