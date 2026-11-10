# SOLID in this codebase

SOLID is five design principles from object-oriented programming. Some of them matter a lot in
a React + TypeScript app, some barely. This page shows each one with real code from this repo,
then what it looks like done wrong. Where a principle is not very relevant, it says so.

The rule of thumb for this repo: **apply a principle when it removes a real problem, not to
tick a box.** An interface with one implementation and no reason to vary is just noise.

## S: Single responsibility

> A module should have one reason to change.

This principle is the one you will use every day. Look at how the profile page is split:

| File | Its one job | Changes when... |
| --- | --- | --- |
| `src/domain/skill-level.ts` | Turn a score into a level | the level thresholds change |
| `src/domain/rate-skills.ts` | Give every area a rating | the rating rules change |
| `src/features/profile/hooks/use-skill-ratings.ts` | Connect the report in the cache to `rateSkills` | where the report comes from changes |
| `src/features/profile/components/profile-page.tsx` | Lay out the page | the design changes |

The rule itself is tiny and has no idea React exists:

```ts
// src/domain/skill-level.ts
export function levelForScore(score: number): SkillLevel {
  const clamped = Math.min(100, Math.max(0, score));
  if (clamped >= 85) return 'expert';
  if (clamped >= 65) return 'advanced';
  if (clamped >= 40) return 'intermediate';
  if (clamped > 0) return 'beginner';
  return 'none';
}
```

And the page only renders:

```tsx
// src/features/profile/components/profile-page.tsx
export function ProfilePage() {
  const profile = useSkillRatings();
  if (!profile) return <NoReportNotice />;
```

**Done wrong:** one component that reads the cache, decides levels and renders.

```tsx
// counterexample: three reasons to change in one place
export function ProfilePage() {
  const { data: report } = useQuery({ queryKey: ['coach-report'], queryFn: skipToken });
  return report?.assessments.map((a) => (
    <div key={a.area}>
      {a.area}: {a.score >= 85 ? 'Expert' : a.score >= 65 ? 'Advanced' : a.score >= 40 ? 'Intermediate' : 'Beginner'}
    </div>
  ));
}
```

The thresholds are now hidden in JSX, copied wherever levels are shown, and testable only by
rendering a page.

## O: Open/closed

> Open for extension, closed for modification.

In React this shows up as **lookup tables instead of scattered `switch` statements**, and as
**new implementations instead of edited callers**.

Labels for levels live in one table. Adding a level means adding one line here, not finding
every `switch` in the UI:

```ts
// src/domain/skill-level.ts
export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  none: 'Not shown',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
};
```

Because the type is `Record<SkillLevel, string>`, TypeScript fails the build if a level is missing.

The coach is the bigger example. A new coach (say, the future Java backend on a different URL,
or another AI) is a new class implementing `CoachService` plus one `case` in the composition
root. No feature, hook or component changes.

**Done wrong:** the hook decides which coach to call.

```ts
// counterexample: every new coach means editing the upload hook
const report =
  import.meta.env.VITE_COACH_MODE === 'http'
    ? await fetch('/api/coach/analyze', { method: 'POST', body: JSON.stringify({ cvText }) }).then((r) => r.json())
    : fakeReport(cvText);
```

## L: Liskov substitution

> Anything that implements an interface must be usable wherever the interface is expected.

In this codebase it means one concrete thing: **every `CoachService` must keep the
`CoachReport` contract**, so the rest of the app can swap mock for HTTP without noticing. The
server enforces the contract before anything reaches the browser. For example, Codex may
answer a score of 140, and the engine clamps it so the domain never sees an impossible value:

```ts
// server/src/infrastructure/codex-coach-engine.ts
function clampScores(report: CoachReport): CoachReport {
  return {
    ...report,
    assessments: report.assessments.map((a) => ({
      ...a,
      score: Math.min(100, Math.max(0, a.score)),
    })),
  };
}
```

**Done wrong:** an implementation that technically matches the type but breaks the promise,
e.g. returning `null` for a missing area or throwing a raw `Response` instead of an `Error`.
Every caller then needs a special case for that one implementation.

Beyond that, Liskov is **barely relevant in React**: we do not use class inheritance for
components, so there is little to substitute. Do not go looking for it.

## I: Interface segregation

> Do not force code to depend on methods it does not use.

The clearest example is how the server sees the Codex SDK. The SDK has many classes and options;
the engine declares only the two methods it actually calls:

```ts
// server/src/infrastructure/codex-coach-engine.ts
/** The part of the Codex SDK this engine uses. The real `Codex` class fits; tests pass a fake. */
export interface CodexThread {
  run(input: string, options?: TurnOptions): Promise<{ finalResponse: string }>;
}
export interface CodexClient {
  startThread(options?: ThreadOptions): CodexThread;
}
```

That is why the engine's tests can use a three-line fake instead of mocking the whole SDK.

The HTTP layer does the same with TypeScript's `Pick`: it needs only `execute` from the use case.

```ts
// server/src/http/app.ts
interface AppDependencies {
  analyzeCv: Pick<AnalyzeCv, 'execute'>;
}
```

In React components the same idea is just **small props**: `SkillRatingCard` takes one
`rating`, not the whole report.

## D: Dependency inversion

> High-level code should depend on abstractions, not on concrete implementations.

This is the principle that shapes the whole architecture. The upload hook needs a coach and a
PDF reader, but it never imports them. It asks for the interfaces:

```tsx
// src/app/services.tsx
export interface Services {
  coach: CoachService;
  extractCvText: (file: File) => Promise<string>;
}
```

```ts
// src/features/upload/hooks/use-analyze-cv.ts
  const { coach, extractCvText } = useServices();
```

Only the composition root knows the concrete classes (see [Data flow](/docs/data-flow)).
Two big wins follow:

1. **Tests inject fakes** with one line, `renderWithProviders(<UploadPage />, { services: { coach: fakeCoach } })`.
2. **Switching mock to HTTP is configuration**, not a code change.

The server mirrors this: `AnalyzeCv` depends on the `CoachEngine` and `AnalysisRepository`
interfaces from `ports.ts`, and `main.ts` plugs in Codex and SQLite.

**Done wrong:**

```ts
// counterexample: the hook is welded to one implementation
import { HttpCoachService } from '@/infrastructure/coach/http-coach-service';

const coach = new HttpCoachService();
```

ESLint forbids this import inside `src/features`, so you will see an error if you try.

### When *not* to add an abstraction

`PathStepView`, `rateSkills` and the Zustand store have no interface in front of them, on
purpose: there is one implementation and no reason for a second. Add an interface when something
really varies (mock vs HTTP, Codex vs another AI) or when a test needs a fake for something slow
or external. Otherwise, call the function.
