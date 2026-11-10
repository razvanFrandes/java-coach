import { useMemo } from 'react';
import { rateSkills } from '@/domain/rate-skills';
import { useCoachReport } from '@/features/coach-report/hooks/use-coach-report';

/** The coach's summary plus a rating per skill area, or undefined before any upload. */
export function useSkillRatings() {
  const report = useCoachReport();
  return useMemo(
    () => (report ? { summary: report.summary, ratings: rateSkills(report) } : undefined),
    [report],
  );
}
