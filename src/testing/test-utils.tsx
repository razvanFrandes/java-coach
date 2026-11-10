import type { ReactElement, ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { coachReportQueryKey } from '@/hooks/use-coach-report';
import { createQueryClient } from '@/lib/query-client';
import type { CoachReport } from '@/types/api';

interface Options {
  /** The URL the test starts on. */
  route?: string;
  /** Puts this report in the cache, as if a CV had already been analysed. */
  report?: CoachReport;
  /** Set to false when the test renders its own router. */
  withRouter?: boolean;
}

/** The providers the app uses (TanStack Query and a router), for render() and renderHook(). */
export function createWrapper({ route = '/', report, withRouter = true }: Options = {}) {
  const queryClient = createQueryClient();
  if (report) queryClient.setQueryData(coachReportQueryKey, report);

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {withRouter ? <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter> : children}
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  return render(ui, { wrapper: createWrapper(options) });
}
