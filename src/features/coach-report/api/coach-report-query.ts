/**
 * The latest CoachReport lives in the TanStack Query cache under this key.
 * It is written by the upload feature (setQueryData) and read by every other feature.
 * The key is listed in src/app/query-client.ts, so the report survives a page reload.
 */
export const coachReportQueryKey = ['coach-report'] as const;
