# State

"State" is any data that changes while the app runs. The hard part is not storing it; it is
deciding **where** each piece lives. This app uses exactly four places, and each has one job.

| Where | What lives there | Why there |
| --- | --- | --- |
| **TanStack Query** | The `CoachReport` (key `['coach-report']`) and the upload mutation | It comes from an async source (the coach). TanStack gives loading/error states and a cache that every page can read. |
| **Zustand** | Which learning steps are done | Pure client state: the user creates it by clicking, no server knows about it, several components need it. |
| **localStorage** | Copies of the two above | So a reload does not lose the report or your progress. Nothing reads it directly. |
| **`useState`** | Things one component needs: the upload stage, whether a file is dragged over the drop zone | Nobody else cares, so it stays local. |

On the server, **SQLite** keeps every analysis so the same CV is not sent to Codex twice. That
is server state; the browser never sees the database.

No other state library (Redux, Context-as-store, MobX...) is used. If you think you need one,
one of the four rows above almost certainly fits.

## TanStack Query: data that comes from the coach

The upload hook writes the report into the cache:

```ts
// src/features/upload/hooks/use-analyze-cv.ts
    onSuccess: (report) => queryClient.setQueryData(coachReportQueryKey, report),
```

Every page reads it through `useCoachReport()`, which never fetches by itself (`skipToken`).
There is exactly **one** copy of the report, in the cache. Pages derive what they need from it
with domain functions instead of storing derived copies.

### Surviving a reload

The query client is wrapped in a *persister* that writes selected queries to localStorage:

```ts
// src/app/query-client.ts
/** Query keys whose data survives a page reload (saved in localStorage). */
const PERSISTED_QUERY_KEYS = new Set(['coach-report']);

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: createSyncStoragePersister({
    storage: window.localStorage,
    key: 'java-coach:query-cache',
  }),
  // Bump this when the CoachReport shape changes, so old cached reports are dropped.
  buster: 'coach-report-v1',
```

The `buster` matters: if you change the shape of `CoachReport`, change the string, or users will
load an old report with the old shape.

## Zustand: learning progress

Progress is created by the user, belongs to the browser and is needed by the learning path page
and the dashboard. That is client UI state, so it is a Zustand store:

```ts
// src/features/learning-path/model/learning-progress-store.ts
export const useLearningProgressStore = create<LearningProgressState>()(
  persist(
    (set) => ({
      completedStepIds: [],
      toggleStep: (stepId) =>
        set((state) => ({
          completedStepIds: state.completedStepIds.includes(stepId)
            ? state.completedStepIds.filter((id) => id !== stepId)
            : [...state.completedStepIds, stepId],
        })),
      reset: () => set({ completedStepIds: [] }),
    }),
```

The `persist` middleware saves it under `java-coach:learning-progress`. Progress is stored by
step id, so analysing the same CV again keeps your ticks.

Components subscribe to **only the part they use**, which keeps re-renders small:

```ts
// src/features/learning-path/hooks/use-learning-path.ts
  const completedStepIds = useLearningProgressStore((state) => state.completedStepIds);
  const toggleStep = useLearningProgressStore((state) => state.toggleStep);
```

## Where the two meet

`useLearningPath` combines server state (the report) with client state (progress) and returns
one object for the page. The combination is computed, never stored:

```ts
// src/features/learning-path/hooks/use-learning-path.ts
    return {
      steps,
      progress: summarizeProgress(orderedSteps, completedStepIds),
      nextStep: findNextStep(orderedSteps, completedStepIds),
      toggleStep,
    };
```

## Common mistakes

**Copying query data into a store.** Then there are two reports, and sooner or later they disagree.

```ts
// counterexample: do not do this
const useReportStore = create(() => ({ report: undefined as CoachReport | undefined }));
// ...and in the upload hook:
onSuccess: (report) => useReportStore.setState({ report }),
```

**Storing derived data.** Levels, gaps, the ordered path and the progress percentage are all
computed from the report and the completed ids. Store the inputs, compute the outputs.

**Reading localStorage directly.** Only the persister and the `persist` middleware touch it.
If a component calls `localStorage.getItem`, it bypasses the cache and goes stale.

## In tests

Zustand stores are module-level singletons, so the test setup resets them after each test, next
to clearing localStorage:

```ts
// src/test/setup.ts
afterEach(() => {
  cleanup();
  server.resetHandlers();
  globalThis.localStorage?.clear();
  // Zustand stores are module singletons: reset them so tests do not leak state.
  useLearningProgressStore.getState().reset();
});
```
