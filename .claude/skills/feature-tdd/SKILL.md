---
name: feature-tdd
description: Use when adding a new feature or changing the behaviour of an existing one in Java Coach (web or server). Walks through spec -> complete test suite -> confirm red -> implement -> refactor -> check -> commit. Not for pure refactors, which keep existing tests green without new specs.
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
- Unclear requirement: ask the user before writing tests.

## 2. Full test suite, before any implementation

Write all three kinds the feature needs, next to where the code will live:

| Kind        | Location                                   | Tools                                               |
| ----------- | ------------------------------------------ | --------------------------------------------------- |
| Domain unit | `src/domain/<rule>.test.ts`                | plain `expect`, no mocks                            |
| Hook        | `src/features/<f>/hooks/<hook>.test.tsx`   | `renderHook` + `createWrapper` from `@/test/render` |
| Component   | `src/features/<f>/components/<c>.test.tsx` | `renderWithProviders`, `screen`, `userEvent`        |
| Server      | `server/src/**/<x>.test.ts`                | fakes for engine/repo, `supertest` for routes       |

Rules:

- Every acceptance criterion has at least one test.
- Domain tests cover every branch (100% coverage is enforced on `src/domain`).
- Component tests act like a user: `userEvent.setup()`, find by role/label/text.
- Inject fakes through `services` in `renderWithProviders` / `createWrapper`. Use MSW
  (`server.use(http.post(...))`) only when testing `HttpCoachService` or code that uses it.
- Reuse fixtures from `src/test/fixtures/` before making new ones.

## 3. Confirm red

Run `pnpm test -- <paths>` once. Every new test must fail because the code does not exist yet
(missing module, missing export, element not found), never because of a typo or a broken test.
Fix broken tests now, before implementing.

## 4. Implement until the whole suite is green

- Rules go in `src/domain` first, then hooks, then components (components render only).
- Do not edit a test to make it pass. If a test turns out wrong, update the spec criterion
  first, then the test, and tell the user which one and why.
- When green, refactor (names, duplication, file placement) and keep it green.

## 5. Check and commit

```bash
pnpm check            # lint + typecheck + all tests
pnpm test:coverage    # domain must stay at 100%
git add -A && git commit -m "feat(<feature>): <what the user can now do>"
```

Report lint, typecheck and test results to the user.
