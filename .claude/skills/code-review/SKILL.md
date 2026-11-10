---
name: code-review
description: Use when asked to review a diff, branch, PR or files in Java Coach. Checks layer boundaries, SOLID problems that matter here, state placement and test quality, and reports each finding with file:line, severity and a concrete fix.
---

# Code review checklist (Java Coach)

## How to run

1. Get the diff: `git diff main...HEAD` (or the files/PR named by the user).
2. Read each changed file in full, not only the hunk.
3. Run `pnpm check` and include the result.
4. Go through the checklist below, then report.

## 1. Layer boundaries

- [ ] `src/domain/**` imports only from `src/domain` (no React, `@/`, fetch, storage, pdfjs).
- [ ] Features do not import `src/infrastructure/**`; they use `useServices()`.
- [ ] Implementations are chosen only in `src/app/composition-root.ts` / `server/src/main.ts`.
- [ ] `server/src/application/**` does not import Express, better-sqlite3 or the Codex SDK.
- [ ] No secrets or API keys in frontend code or `VITE_*` variables.

## 2. SOLID, where it matters here

- **Single responsibility**: a component that fetches, decides and renders at once. A hook
  that mixes unrelated state. A domain file with rules about two different concepts.
- **Dependency inversion**: code that constructs `MockCoachService`/`HttpCoachService`/`Codex`
  itself instead of receiving a `CoachService`/`CoachEngine`.
- **Open/closed**: `switch` on skill area or level repeated in many places instead of one
  lookup table in the domain.
- **Over-engineering**: an interface or factory with one implementation and no reason to
  vary. Flag it. Fewer abstractions is the default.
- Liskov and interface segregation rarely apply in React; do not invent findings.

## 3. Logic and state placement

- [ ] No business rules in JSX (filtering, ordering, level maths, validation).
- [ ] Coach data lives in TanStack Query; UI state shared across components in Zustand; local
      state in `useState`. No other state libraries, no duplicated copies of query data in stores.
- [ ] Domain vocabulary used consistently (CoachReport, SkillArea, SkillLevel, Gap, LearningStep).

## 4. Tests

- [ ] A spec in `docs/specs/` exists and every acceptance criterion has a test.
- [ ] Component tests use roles/labels/text and `userEvent`, not class names or internals.
- [ ] No snapshot-only tests; assertions state the behaviour.
- [ ] No test was weakened, skipped (`.skip`, `.only`) or deleted to get green.
- [ ] No real network or Codex calls; MSW or fakes only.
- [ ] Domain coverage still 100% (`pnpm test:coverage`).

## 5. Docs

- [ ] If code shown in `docs/guide/` changed, the guide was updated (snippet test passes).

## Report format

One line per finding, most severe first:

```
[high] src/features/gaps/components/gap-list.tsx:24: sorts gaps by score in JSX.
       Move to detectGaps() in src/domain/gaps.ts, which already orders them.
[medium] ...
[low] ...
```

Severity: **high** = breaks a layer rule, a security rule or hides a bug; **medium** = SOLID or
test-quality problem that will spread if copied; **low** = naming, readability.
End with the `pnpm check` result and a one-line verdict (merge / fix first).
If nothing is found, say so plainly; do not pad the list.
