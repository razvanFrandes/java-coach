/// <reference types="vitest/config" />
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    // The frontend calls /api/...; Vite forwards it to the Node server (unless MSW answers first).
    proxy: { '/api': 'http://localhost:3001' },
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'web',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['src/testing/setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'server',
          environment: 'node',
          include: ['server/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      // The logic: controllers (hooks), models (api, stores, utils) and the server.
      include: [
        'src/features/*/{api,hooks,stores,utils}/**/*.ts',
        'src/hooks/**/*.ts',
        'src/lib/**/*.ts',
        'server/src/**/*.ts',
      ],
      exclude: ['**/*.test.ts', 'src/lib/utils.ts', 'server/src/server.ts'],
      thresholds: {
        // The rules users rely on must be fully tested.
        'server/src/services/report.service.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/features/*/{hooks,utils}/**/*.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
});
