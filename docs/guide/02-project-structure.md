# Project structure

The frontend follows the layout of
[bulletproof-react](https://github.com/alan2207/bulletproof-react), a well-known reference for
React projects: code is grouped **by feature**, with a few shared folders around it.

## The frontend

```text
src/
  main.tsx               starts the app (and MSW in mock mode)
  app/                   the application itself
    index.tsx            <App />: providers + router
    provider.tsx         TanStack Query, saved to localStorage
    router.tsx           URL -> page
    routes/              one file per page: dashboard, upload, profile, gaps, learning-path, docs
  features/              one folder per feature
    upload/
      api/               analyze-cv.ts: the HTTP call + its TanStack Query mutation
      hooks/             use-cv-upload.ts: what happens when a file is picked
      components/        cv-dropzone, upload-progress, upload-error
      utils/             validate-cv.ts: file and text rules
    learning-path/       stores/ (Zustand), hooks/, components/
    profile/  gaps/  dashboard/  docs/
  components/
    ui/                  shadcn/ui components (generated, do not edit)
    layouts/             app-layout.tsx: header and navigation
    page-header.tsx      no-report.tsx
  hooks/                 hooks used by many features (use-coach-report.ts)
  lib/                   api-client, query-client, extract-pdf-text, labels
  types/api.ts           the JSON the server sends
  config/env.ts          the VITE_* settings
  mocks/                 MSW handlers and the sample report (mock mode and tests)
  testing/               test setup and helpers
```

A feature only gets the subfolders it needs: `profile/` has just `components/`.

## Where MVC fits

| MVC        | Frontend folder                                  | Example                                   |
| ---------- | ------------------------------------------------ | ----------------------------------------- |
| Model      | `features/*/api`, `features/*/stores`, `types/`  | `analyzeCv()`, `useProgressStore`         |
| Controller | `features/*/hooks`, `hooks/`                     | `useCvUpload()`, `useLearningPath()`      |
| View       | `features/*/components`, `app/routes`            | `CvDropzone`, `UploadRoute`               |

The rule of thumb: **components show, hooks decide, api/stores hold the data.**
A component gets everything through props or one hook call and has no `fetch`, no
`localStorage` and no business rule inside.

Here is the whole upload page. It calls one controller hook and lays out three components:

```tsx
// src/app/routes/upload.tsx
export function UploadRoute() {
  const { upload, reset, status, error, isBusy } = useCvUpload();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Upload your CV"
        description="The coach reads your CV, rates your Java skills by area and builds a learning path."
      />
      <CvDropzone onFile={upload} disabled={isBusy} />
      {(status === 'reading' || status === 'analyzing') && <UploadProgress status={status} />}
      {error && <UploadError message={error} onRetry={reset} />}
    </div>
  );
}
```

## Import rules

Imports go one way: **shared code -> features -> app**.

- Shared folders (`components`, `hooks`, `lib`, `types`, `config`, `mocks`) never import a
  feature.
- A feature imports shared code and its own files (with relative paths like `../api/...`).
  It never imports another feature.
- Pages in `app/routes` are where features meet. The dashboard page, for example, uses
  `useLearningPath` from `learning-path` and the cards from `dashboard`.

ESLint enforces this, so a wrong import fails `pnpm lint`:

```js
// eslint.config.js
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
```

## Styling

Only **Tailwind** classes and **shadcn/ui** components: `Card`, `Badge`, `Button`, `Table`,
`Empty`, `Alert`, `Progress`, `Checkbox`... There is no custom CSS file besides the theme
colours that shadcn generated in `src/index.css`. Need something new? Add the shadcn component
first (`pnpm dlx shadcn@latest add <name>`) and only then reach for Tailwind classes, mostly for
layout (`grid`, `gap-4`, `space-y-6`).

## Naming

- Files are kebab-case: `learning-step-card.tsx`. Components are PascalCase: `LearningStepCard`.
- Hooks start with `use`. Pages end with `Route`: `ProfileRoute`.
- Use the words from the API: report, skill, level, gap, learning step.
