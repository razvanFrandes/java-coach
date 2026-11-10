import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
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
});
afterAll(() => server.close());
