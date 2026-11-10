import { act, renderHook } from '@testing-library/react';
import { sampleReport } from '@/mocks/data/coach-report';
import { createWrapper } from '@/testing/test-utils';
import type { CoachReport } from '@/types/api';
import { useProgressStore } from '../stores/progress-store';
import { useLearningPath } from './use-learning-path';

function renderLearningPath(report?: CoachReport) {
  return renderHook(() => useLearningPath(), { wrapper: createWrapper({ report }) });
}

describe('useLearningPath', () => {
  it('AC3: is undefined without a report', () => {
    const { result } = renderLearningPath();

    expect(result.current).toBeUndefined();
  });

  it('AC4: keeps the server order and adds done and the prerequisite titles', () => {
    useProgressStore.getState().toggleStep('jvm-1');
    const { result } = renderLearningPath(sampleReport);

    const steps = result.current?.steps ?? [];
    expect(steps.map((s) => s.step.id)).toEqual([
      'concurrency-1',
      'concurrency-2',
      'jvm-1',
      'collections-1',
      'testing-1',
    ]);
    expect(steps.map((s) => s.done)).toEqual([false, false, true, false, false]);
    expect(steps[1]?.prerequisiteTitles).toEqual(['Threads and executors']);
    // testing-1 also lists "unknown-step", which is not in the path: it is skipped.
    expect(steps[4]?.prerequisiteTitles).toEqual(['Choosing the right collection']);
  });

  it('AC5: sums up the progress and ignores ids that are not in the path', () => {
    useProgressStore.getState().toggleStep('concurrency-1');
    useProgressStore.getState().toggleStep('not-in-this-path');
    const { result } = renderLearningPath(sampleReport);

    expect(result.current?.progress).toEqual({
      completed: 1,
      total: 5,
      percent: 20,
      remainingHours: 8 + 5 + 4 + 6,
    });
  });

  it('AC5: rounds the percent and reports 0 for an empty path', () => {
    const threeSteps = { ...sampleReport, learningPath: sampleReport.learningPath.slice(0, 3) };
    useProgressStore.getState().toggleStep('concurrency-1');
    expect(renderLearningPath(threeSteps).result.current?.progress.percent).toBe(33);

    const empty = { ...sampleReport, learningPath: [] };
    expect(renderLearningPath(empty).result.current?.progress).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
      remainingHours: 0,
    });
  });

  it('AC6: nextStep is the first step that is not done, and moves on when it is done', () => {
    const { result } = renderLearningPath(sampleReport);
    expect(result.current?.nextStep?.id).toBe('concurrency-1');

    act(() => result.current?.toggleStep('concurrency-1'));

    expect(result.current?.nextStep?.id).toBe('concurrency-2');
  });

  it('AC6: nextStep is undefined when every step is done', () => {
    for (const step of sampleReport.learningPath) useProgressStore.getState().toggleStep(step.id);
    const { result } = renderLearningPath(sampleReport);

    expect(result.current?.nextStep).toBeUndefined();
  });
});
