import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coachReportQueryKey } from '@/hooks/use-coach-report';
import { apiPost } from '@/lib/api-client';
import type { AnalyzeCvResponse, CoachReport } from '@/types/api';

/** Sends the CV text to the server and returns the coach's report. */
export async function analyzeCv(cvText: string): Promise<CoachReport> {
  const { report } = await apiPost<AnalyzeCvResponse>('/api/coach/analyze', { cvText });
  return report;
}

/** The same call as a TanStack Query mutation. On success the report goes into the cache. */
export function useAnalyzeCv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: analyzeCv,
    onSuccess: (report) => queryClient.setQueryData(coachReportQueryKey, report),
  });
}
