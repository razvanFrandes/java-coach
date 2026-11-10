---
name: feature-tdd
description: Use when adding a new feature or changing the behaviour of an existing one in Java Coach (web or server). Walks through spec -> complete test suite -> confirm red -> implement -> refactor -> check -> commit, and says which MVC files a feature needs. Not for pure refactors, which keep existing tests green without new specs.
---

# Feature TDD (spec, full suite, implement)

Tests are written in one batch from a spec, not one at a time.

## 1. Spec: `docs/specs/<feature>.md`

```markdown
# <Feature name>

<One paragraph: what the user can do and why.>

## Acceptance criteria

1. Given <state>, when <action>, then <observable result>.
2. ...

## Out of scope

- ...
```

- Number every criterion. Tests refer to them: `it('AC3: shows an error for files over 5 MB')`.
- Criteria describe what a user sees or what a function returns, never how it is built.
- If the server's JSON changes, update `docs/api-contract.md` in the same step.
- Unclear requirement: ask the user before writing tests.

## 2. Plan the files (MVC)

Frontend, inside `src/features/<feature>/` (only the folders you need):

| Piece                      | Folder                                                       | Example                                       |
| -------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| HTTP call + query/mutation | `api/`                                                       | `analyze-cv.ts` (`analyzeCv`, `useAnalyzeCv`) |
| Client state               | `stores/`                                                    | `progress-store.ts` (Zustand + persist)       |
| Controller hook            | `hooks/`                                                     | `use-cv-upload.ts`                            |
| Plain rules                | `utils/`                                                     | `validate-cv.ts`                              |
| View                       | `components/`                                                | `cv-dropzone.tsx` (shadcn/ui inside)          |
| Page                       | `src/app/routes/<page>.tsx` + a line in `src/app/router.tsx` |                                               |

Server, in `server/src/`: route -> controller -> service -> model, zod schema in `schemas/`.
Rules that build the report go in `services/report.service.ts` as plain functions.

## 3. Full test suite, before any implementation

| Kind   | Location                                 | Tools                                                         |
| ------ | ---------------------------------------- | ------------------------------------------------------------- |
| Rules  | `src/features/<f>/utils/<x>.test.ts`     | plain `expect`                                                |
| Hook   | `src/features/<f>/hooks/<hook>.test.tsx` | `renderHook` + `createWrapper` (`@/testing/test-utils`)       |
| Page   | `src/app/routes/<page>.test.tsx`         | `renderWithProviders`, `screen`, `userEvent`                  |
| Server | `server/src/**/<x>.test.ts`              | `vi.mock('./codex.service')`, `initDb(':memory:')`, supertest |

- Every acceptance criterion has at least one test.
- Pages act like a user: `userEvent.setup()`, find by role/label/text.
- Network: MSW handlers from `src/mocks/handlers.ts` answer by default; override with
  `server.use(http.post(...))` from `@/testing/server`. Seed a report with
  `renderWithProviders(ui, { report: sampleReport })`.
- Modules with side effects (pdf.js, Codex): `vi.mock` them.
- Reuse `src/mocks/data/coach-report.ts` and `src/testing/fixtures/` before making new data.

## 4. Confirm red

Run `pnpm test -- <paths>` once. Every new test must fail because the code does not exist yet
(missing module, missing export, element not found), never because of a typo.
Fix broken tests now, before implementing.

## 5. Implement until the whole suite is green

- Model and rules first, then the controller hook, then components and the page.
- Do not edit a test to make it pass. If a test turns out wrong, update the spec criterion
  first, then the test, and tell the user which one and why.
- When green, refactor (names, duplication, file placement) and keep it green.
- If a guide in `docs/guide/` quotes code you changed, update the guide.

## 6. Check and commit

```bash
pnpm check            # lint + typecheck + all tests
pnpm test:coverage    # hooks, utils and report.service.ts stay at 100%
git add -A && git commit -m "feat(<feature>): <what the user can now do>"
```

Report lint, typecheck and test results to the user.
