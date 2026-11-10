import { skipToken, useQuery } from '@tanstack/react-query';
import type { CoachReport } from '@/domain/types';
import { coachReportQueryKey } from '../api/coach-report-query';

/**
 * Reads the latest CoachReport, or undefined when no CV was analysed yet.
 * `skipToken` means "never fetch": the report only enters the cache when an upload succeeds.
 */
export function useCoachReport(): CoachReport | undefined {
  const { data } = useQuery<CoachReport>({ queryKey: coachReportQueryKey, queryFn: skipToken });
  return data;
}
