import type { ReactElement, ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ServicesProvider, type Services } from '@/app/services';
import { createQueryClient } from '@/app/query-client';
import type { CoachReport } from '@/domain/types';
import { coachReportQueryKey } from '@/features/coach-report/api/coach-report-query';

export interface ProviderOptions {
  services?: Partial<Services>;
  queryClient?: QueryClient;
  route?: string;
  /** Seeds the query cache as if this CV had already been analysed. */
  report?: CoachReport;
}

const unusedServices: Services = {
  coach: { analyzeCv: () => Promise.reject(new Error('coach not provided in this test')) },
  extractCvText: () => Promise.reject(new Error('extractCvText not provided in this test')),
};

/** Wraps children in every provider the app uses. Shared by renderWithProviders and hook tests. */
export function createWrapper({
  services,
  queryClient = createQueryClient(),
  route = '/',
  report,
}: ProviderOptions = {}) {
  if (report) queryClient.setQueryData(coachReportQueryKey, report);
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ServicesProvider services={{ ...unusedServices, ...services }}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </ServicesProvider>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(ui: ReactElement, options: ProviderOptions = {}) {
  return render(ui, { wrapper: createWrapper(options) });
}
