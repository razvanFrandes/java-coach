import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // The report only changes when the user uploads a CV, so it never goes stale.
      queries: { staleTime: Infinity, gcTime: Infinity, retry: false },
      mutations: { retry: false },
    },
  });
}

/** Saves successful queries in localStorage, so the report survives a page reload. */
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: createSyncStoragePersister({
    storage: window.localStorage,
    key: 'java-coach:query-cache',
  }),
  // Change this when the report's shape changes, so old saved reports are dropped.
  buster: 'coach-report-v2',
};
