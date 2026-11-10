import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { useLearningProgressStore } from '@/features/learning-path/model/learning-progress-store';
import { server } from './msw/server';

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
  // Zustand stores are module singletons: reset them so tests do not leak state.
  useLearningProgressStore.getState().reset();
});
afterAll(() => server.close());
