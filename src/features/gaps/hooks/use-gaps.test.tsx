import { renderHook } from '@testing-library/react';
import { sampleReport } from '@/test/fixtures/coach-report';
import { createWrapper } from '@/test/render';
import { useGaps } from './use-gaps';

describe('useGaps', () => {
  it('AC6: returns undefined when no CV was analysed', () => {
    const { result } = renderHook(() => useGaps(), { wrapper: createWrapper() });

    expect(result.current).toBeUndefined();
  });

  it('AC1/AC4: returns the gaps of the current report, in order', () => {
    const { result } = renderHook(() => useGaps(), {
      wrapper: createWrapper({ report: sampleReport }),
    });

    // sampleReport: concurrency 0, jvm 0, collections 30, testing 35; the rest are >= 45.
    expect(result.current?.map((g) => g.area)).toEqual([
      'concurrency',
      'jvm',
      'collections',
      'testing',
    ]);
  });
});
