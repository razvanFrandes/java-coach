import { useMemo } from 'react';
import { detectGaps } from '@/domain/gaps';
import { rateSkills } from '@/domain/rate-skills';
import type { Gap } from '@/domain/types';
import { useCoachReport } from '@/features/coach-report/hooks/use-coach-report';

/** Gaps of the current report, most urgent first, or undefined before any upload. */
export function useGaps(): Gap[] | undefined {
  const report = useCoachReport();
  return useMemo(() => (report ? detectGaps(rateSkills(report)) : undefined), [report]);
}
