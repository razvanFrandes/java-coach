import { renderHook } from '@testing-library/react';
import { sampleReport } from '@/test/fixtures/coach-report';
import { createWrapper } from '@/test/render';
import { useSkillRatings } from './use-skill-ratings';

describe('useSkillRatings', () => {
  it('AC8: returns undefined when no CV was analysed', () => {
    const { result } = renderHook(() => useSkillRatings(), { wrapper: createWrapper() });

    expect(result.current).toBeUndefined();
  });

  it('AC4/AC9: returns the summary and a rating for every area', () => {
    const { result } = renderHook(() => useSkillRatings(), {
      wrapper: createWrapper({ report: sampleReport }),
    });

    expect(result.current?.summary).toBe(sampleReport.summary);
    expect(result.current?.ratings).toHaveLength(9);
    expect(result.current?.ratings.find((r) => r.area === 'spring')?.level).toBe('intermediate');
  });
});
