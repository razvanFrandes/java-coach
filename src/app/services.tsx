import { createContext, useContext, type ReactNode } from 'react';
import type { CoachService } from '@/domain/coach-service';

/**
 * Everything that talks to the outside world, injected from the top of the tree.
 * Components and hooks call useServices() instead of importing implementations,
 * so tests can pass fakes and the composition root can pick mock or HTTP.
 */
export interface Services {
  coach: CoachService;
  extractCvText: (file: File) => Promise<string>;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  services,
  children,
}: {
  services: Services;
  children: ReactNode;
}) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs next to its provider
export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices must be used inside <ServicesProvider>');
  return services;
}
