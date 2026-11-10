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
    rules: {
      // A leading underscore marks a parameter or variable that is unused on purpose.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
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

  // Import direction (as in bulletproof-react): shared code -> features -> app.
  // Shared code (components, hooks, lib, types, config, mocks) is used by everyone and
  // imports no feature. A feature imports shared code and its own files (relative paths),
  // never another feature: pages in src/app/routes put features together.
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/hooks/**/*.ts',
      'src/lib/**/*.ts',
      'src/types/**/*.ts',
      'src/config/**/*.ts',
      'src/mocks/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/app/*'],
              message: 'Shared code must not import features or the app.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*'],
              message:
                'A feature must not import another feature. Use relative imports inside a feature, and combine features in src/app/routes.',
            },
            { group: ['@/app/*'], message: 'Features must not import the app.' },
          ],
        },
      ],
    },
  },
  // The server is a separate program: it never imports frontend code.
  {
    files: ['server/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/*', '../../src/*'], message: 'The server must not import the frontend.' },
          ],
        },
      ],
    },
  },

  prettier,
);
