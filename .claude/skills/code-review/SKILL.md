---
name: code-review
description: Use when asked to review a diff, branch, PR or files in Java Coach. Checks MVC placement, import direction, shadcn/Tailwind-only styling, state placement and test quality, and reports each finding with file:line, severity and a concrete fix.
---

# Code review checklist (Java Coach)

## How to run

1. Get the diff: `git diff main...HEAD` (or the files/PR named by the user).
2. Read each changed file in full, not only the hunk.
3. Run `pnpm check` and include the result.
4. Go through the checklist below, then report.

## 1. MVC placement

- [ ] Components (`features/*/components`, `components/`) only render props and call callbacks:
      no `fetch`, no `localStorage`, no business rules.
- [ ] Pages (`app/routes`) call hooks and lay out components; no rules inline.
- [ ] HTTP calls live in `features/*/api` and go through `apiPost` in `src/lib/api-client.ts`.
- [ ] Server: routes only map URLs, controllers only validate/call/respond, services do the
      work, models hold the SQL. Errors are `HttpError`s.
- [ ] Report rules (levels, gaps, path order) live in `server/src/services/report.service.ts`,
      not repeated in the browser.

## 2. Import direction

- [ ] Shared code (`components`, `hooks`, `lib`, `types`, `config`, `mocks`) imports no feature.
- [ ] No feature imports another feature; features meet in `app/routes`.
- [ ] The server imports nothing from `src/`.
- [ ] No secrets or API keys in frontend code or `VITE_*` variables.

## 3. Styling

- [ ] Built from shadcn/ui components (`Card`, `Badge`, `Table`, `Empty`, `Alert`, ...).
- [ ] No hand-made equivalents (`rounded-xl border bg-card p-5` instead of `Card`), no custom
      CSS, no hex or palette colours (`text-red-600`); only theme tokens.
- [ ] `src/components/ui/` was not hand-edited.

## 4. Simplicity

- [ ] No DDD layers, ports/adapters, factories or interfaces with a single implementation.
- [ ] No abstraction added "for later". Prefer a plain function.
- [ ] Names use the API's words: report, skill, level, gap, learning step.

## 5. State

- [ ] Server data in TanStack Query (read with `useCoachReport()`), never copied into
      `useState` or a store.
- [ ] Shared client state in a Zustand store with selectors; one-component state in `useState`.

## 6. Tests

- [ ] A spec in `docs/specs/` exists and every acceptance criterion has a test (`ACn:` names).
- [ ] Tests use roles/labels/text and `userEvent`, not class names or hook internals.
- [ ] No snapshot-only tests; assertions state the behaviour.
- [ ] No test was weakened, skipped (`.skip`, `.only`) or deleted to get green.
- [ ] No real network or Codex: MSW handlers in the browser tests, `vi.mock` on the server.
- [ ] Coverage limits still pass (`pnpm test:coverage`).

## 7. Docs

- [ ] If code quoted in `docs/guide/` changed, the guide was updated (snippet test passes).
- [ ] If the server's JSON changed, `docs/api-contract.md` and both type files were updated.

## Report format

One line per finding, most severe first:

```
[high] src/features/gaps/components/gap-card.tsx:24: sorts gaps in JSX.
       The server already sends them in order; render report.gaps as is.
[medium] ...
[low] ...
```

Severity: **high** = breaks a placement, import or security rule, or hides a bug;
**medium** = styling or test-quality problem that will spread if copied;
**low** = naming, readability.
End with the `pnpm check` result and a one-line verdict (merge / fix first).
If nothing is found, say so plainly; do not pad the list.
