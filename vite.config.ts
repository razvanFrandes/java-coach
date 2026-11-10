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
    // In http mode the frontend calls /api/... and Vite forwards it to the Node server.
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
          setupFiles: ['src/test/setup.ts'],
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
      include: ['src/domain/**/*.ts', 'server/src/**/*.ts'],
      exclude: ['**/*.test.ts'],
      thresholds: {
        'src/domain/**/*.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
      },
    },
  },
});
