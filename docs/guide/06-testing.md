# Testing

Every feature in this repo is built **test-first, in batches**: write the spec, write the whole
test suite, watch it fail, then write the code.

## The workflow

1. **Spec.** `docs/specs/<feature>.md` lists numbered acceptance criteria (AC1, AC2, ...),
   written as what a user sees or what a function returns.
2. **Full test suite.** Every criterion gets at least one test, and the test name starts with
   its number: `it('AC14: explains when the PDF has no text', ...)`. You write all of them
   before any implementation.
3. **Confirm red.** Run the suite once. Each test must fail because the code does not exist yet
   ("Failed to resolve import"), not because the test has a typo.
4. **Green.** Implement until everything passes.
5. **Refactor** names and structure while everything stays green, then `pnpm check`.

Why batches and not one tiny test at a time? Writing the whole suite first makes you think
through the feature (edge cases, errors, empty states) before the code nudges you toward
whatever is easiest to implement.

Never weaken or delete a test to make it pass. If a test is wrong, fix the spec first, then the
test, and say so in the commit.

## What we test, and with what

| What                         | Tool                                   | Example file                                 |
| ---------------------------- | -------------------------------------- | -------------------------------------------- |
| Rules (plain functions)      | Vitest                                 | `src/features/upload/utils/validate-cv.test.ts` |
| Hooks (controllers)          | `renderHook` from Testing Library      | `use-learning-path.test.tsx`                 |
| Pages                        | Testing Library + `userEvent` + MSW    | `src/app/routes/upload.test.tsx`             |
| Server services and routes   | Vitest, supertest, SQLite `:memory:`   | `server/src/services/coach.service.test.ts`  |
| Docs                         | a test that compares snippets to code  | `src/features/docs/docs-snippets.test.ts`    |

Small components (a card, a badge) are covered by the page tests that render them.

## Page tests: act like a user

Find things the way a person does, by role, label or text. Click and type with `userEvent`.
Never assert on class names or on a hook's internals.

```tsx
// src/app/routes/upload.test.tsx
  it('AC14: explains when the PDF has no text', async () => {
    extractPdfTextMock.mockResolvedValue('');
    const { pick } = renderPage();

    await pick(makeFile());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not find any text in this PDF. Is it a scanned image? Export your CV as a text PDF and try again.',
    );
  });
```

`renderWithProviders` (in `src/testing/test-utils.tsx`) wraps the page in TanStack Query and a
router, and can start with a report already in the cache:
`renderWithProviders(<ProfileRoute />, { report: sampleReport })`.

## The network: MSW

Tests never call a real server. MSW intercepts `fetch` and answers with the handlers from
`src/mocks/handlers.ts`, the same ones mock mode uses. A test that needs a different answer
replaces it for itself:

```tsx
// src/app/routes/upload.test.tsx
    server.use(
      http.post(
        '/api/coach/analyze',
        () =>
          HttpResponse.json(
            { error: { code: 'COACH_TIMEOUT', message: 'Codex timed out.' } },
            { status: 504 },
          ),
        { once: true },
      ),
    );
```

## Replacing a module: `vi.mock`

Reading a PDF needs pdf.js and a real file. That has its own test
(`src/lib/extract-pdf-text.test.ts`); the page tests just decide what it returns:

```tsx
// src/app/routes/upload.test.tsx
// Reading a real PDF is tested in src/lib/extract-pdf-text.test.ts. Here we decide what it returns.
vi.mock('@/lib/extract-pdf-text', () => ({ extractPdfText: vi.fn() }));
const extractPdfTextMock = vi.mocked(extractPdfText);
```

The server does the same with Codex. It is never called for real in tests:

```ts
// server/src/services/coach.service.test.ts
// Never call the real Codex in tests: replace the whole module with a mock.
vi.mock('./codex.service', () => ({ askCodex: vi.fn() }));
```

## Hook tests

A controller hook is tested on its own with `renderHook`. Here the store is set up first, then
the hook's result is checked:

```tsx
// src/features/learning-path/hooks/use-learning-path.test.tsx
  it('AC4: keeps the server order and adds done and the prerequisite titles', () => {
    useProgressStore.getState().toggleStep('jvm-1');
    const { result } = renderLearningPath(sampleReport);
```

## Server tests

Services run against an in-memory SQLite database, which is fresh for every test:

```ts
// server/src/services/coach.service.test.ts
  it('AC15: returns the saved report for the same text without asking Codex again', async () => {
    const first = await analyzeCv('My CV text');

    const second = await analyzeCv('  My CV text \n');

    expect(second).toEqual({ report: first.report, cached: true });
    expect(askCodex).toHaveBeenCalledTimes(1);
  });
```

## Coverage

`pnpm test:coverage` fails when the rules lose coverage: the server's `report.service.ts` and
every file in `src/features/*/hooks` and `src/features/*/utils` must stay at 100%.

## Docs that cannot lie

A code block in these guides whose first line names a file (`// src/...`) must match that file.
`docs-snippets.test.ts` checks every such block, so changing the code without the guide fails
the build:

```ts
// src/features/docs/docs-snippets.test.ts
  it.each(snippets.map((s) => [`${s.guide} -> ${s.file}`, s] as const))(
    'AC8: %s matches the source',
```

## Commands

```bash
pnpm test                       # everything, once
pnpm test -- src/app/routes     # one folder
pnpm test:watch                 # re-run on save
pnpm test:coverage              # with the coverage limits
pnpm check                      # lint + typecheck + test, before every commit
```
