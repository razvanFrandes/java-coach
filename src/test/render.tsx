import type { ReactElement, ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ServicesProvider, type Services } from '@/app/services';
import { createQueryClient } from '@/app/query-client';

interface Options {
  services?: Partial<Services>;
  queryClient?: QueryClient;
  route?: string;
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
}: Options = {}) {
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

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  return render(ui, { wrapper: createWrapper(options) });
}
