import { act, renderHook } from '@testing-library/react';
import { sampleReport } from '@/test/fixtures/coach-report';
import { createWrapper } from '@/test/render';
import { useLearningPath } from './use-learning-path';

describe('useLearningPath', () => {
  it('AC9: returns undefined when no CV was analysed', () => {
    const { result } = renderHook(() => useLearningPath(), { wrapper: createWrapper() });

    expect(result.current).toBeUndefined();
  });

  it('AC1/AC10: returns the ordered steps with prerequisite titles', () => {
    const { result } = renderHook(() => useLearningPath(), {
      wrapper: createWrapper({ report: sampleReport }),
    });

    const steps = result.current?.steps ?? [];
    expect(steps.map((s) => s.step.id)).toEqual([
      'concurrency-1',
      'concurrency-2',
      'jvm-1',
      'collections-1',
      'testing-1',
    ]);
    expect(steps[1]?.prerequisiteTitles).toEqual(['Threads and executors']);
  });

  it('AC6/AC11: toggling a step updates done flags, progress and the next step', () => {
    const { result } = renderHook(() => useLearningPath(), {
      wrapper: createWrapper({ report: sampleReport }),
    });

    act(() => result.current?.toggleStep('concurrency-1'));

    expect(result.current?.steps[0]?.done).toBe(true);
    expect(result.current?.progress).toMatchObject({ completed: 1, total: 5 });
    expect(result.current?.nextStep?.id).toBe('concurrency-2');
  });
});
