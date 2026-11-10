import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: Infinity, gcTime: Infinity, retry: false },
      mutations: { retry: false },
    },
  });
}

/** Query keys whose data survives a page reload (saved in localStorage). */
const PERSISTED_QUERY_KEYS = new Set(['coach-report']);

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: createSyncStoragePersister({
    storage: window.localStorage,
    key: 'java-coach:query-cache',
  }),
  // Bump this when the CoachReport shape changes, so old cached reports are dropped.
  buster: 'coach-report-v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.state.status === 'success' && PERSISTED_QUERY_KEYS.has(String(query.queryKey[0])),
  },
};
