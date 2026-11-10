import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { useProgressStore } from '@/features/learning-path/stores/progress-store';
import { server } from './server';

// Radix primitives measure elements; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  globalThis.localStorage?.clear();
  // Zustand stores live as long as the module: reset them so tests do not leak state.
  useProgressStore.getState().reset();
});
afterAll(() => server.close());
