import type { ReactNode } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createQueryClient, persistOptions } from '@/lib/query-client';

const queryClient = createQueryClient();

/** Everything the whole app needs around it. Tests use src/testing/test-utils.tsx instead. */
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      {children}
    </PersistQueryClientProvider>
  );
}
