import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'src/components/ui'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['server/**/*.ts', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },

  // Layer rule: src/domain is pure TypeScript. No React, no I/O, no other layers.
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'react/*'],
              message: 'Domain code must not depend on React.',
            },
            { group: ['@/*', '../*'], message: 'Domain code must not import from other layers.' },
            {
              group: ['pdfjs-dist', 'pdfjs-dist/*', 'zustand', '@tanstack/*'],
              message: 'Domain code must not do I/O or hold state.',
            },
          ],
        },
      ],
      'no-restricted-globals': ['error', 'fetch', 'localStorage', 'window', 'document'],
    },
  },

  // Layer rule: features depend on the CoachService abstraction, never on its implementations.
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/infrastructure/*'],
              message: 'Features get services from useServices(), not by importing infrastructure.',
            },
          ],
        },
      ],
    },
  },

  prettier,
);
