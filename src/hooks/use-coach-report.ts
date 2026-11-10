import { skipToken, useQuery } from '@tanstack/react-query';
import type { CoachReport } from '@/types/api';

/** The latest report lives in the TanStack Query cache under this key. */
export const coachReportQueryKey = ['coach-report'] as const;

/**
 * The latest report, or undefined when no CV was analysed yet.
 * `skipToken` means "never fetch": the report only enters the cache when an upload succeeds
 * (see src/features/upload/api/analyze-cv.ts).
 */
export function useCoachReport(): CoachReport | undefined {
  const { data } = useQuery<CoachReport>({ queryKey: coachReportQueryKey, queryFn: skipToken });
  return data;
}
