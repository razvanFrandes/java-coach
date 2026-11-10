# State

"State" is any data that can change while the app runs. This app has three kinds, and each has
exactly one home.

| Kind             | Example                                  | Where it lives             |
| ---------------- | ---------------------------------------- | -------------------------- |
| Server state     | the coach's report                       | TanStack Query             |
| Client state     | which learning steps you finished        | a Zustand store            |
| Local state      | "is a file being dragged over the zone?" | `useState` in a component  |

No other state libraries. When you add state, ask: does it come from the server? Is it shared
by several components? Or does only one component care?

## Server state: TanStack Query

The report comes from the server, so it is server state. TanStack Query keeps it in a cache
under a **query key**:

```ts
// src/hooks/use-coach-report.ts
/** The latest report lives in the TanStack Query cache under this key. */
export const coachReportQueryKey = ['coach-report'] as const;
```

The upload mutation writes into that key, and every page reads from it (see
[Data flow](/docs/data-flow)). The cache is saved to localStorage, so a reload does not lose the
report:

```ts
// src/lib/query-client.ts
/** Saves successful queries in localStorage, so the report survives a page reload. */
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: createSyncStoragePersister({
    storage: window.localStorage,
    key: 'java-coach:query-cache',
  }),
```

Do not copy the report into `useState` or a store: then there would be two versions that can
disagree. Always read it with `useCoachReport()`.

## Client state: Zustand

Which steps you ticked off is known only to your browser, and both the learning path page and
the dashboard need it. That is client state shared by several components, so it lives in a
small Zustand store. The `persist` middleware saves it in localStorage.

```ts
// src/features/learning-path/stores/progress-store.ts
export const useProgressStore = create<ProgressState>()(
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

Progress is stored by step id, not by position. Re-analysing the same CV gives the same ids,
so your ticks survive.

## Putting both together in a hook

`useLearningPath` is the controller for the learning path. It reads the report (server state)
and the finished steps (client state) and returns exactly what the pages need:

```ts
// src/features/learning-path/hooks/use-learning-path.ts
export function useLearningPath() {
  const report = useCoachReport();
  const completedStepIds = useProgressStore((state) => state.completedStepIds);
  const toggleStep = useProgressStore((state) => state.toggleStep);

  if (!report) return undefined;
```

Note the selectors (`(state) => state.completedStepIds`): a component re-renders only when the
part of the store it reads changes.

## Local state: `useState`

State that only one component cares about stays in that component. The drop zone's
"something is being dragged over me" flag is a good example:

```tsx
// src/features/upload/components/cv-dropzone.tsx
export function CvDropzone({ onFile, disabled }: CvDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
```

## In tests

Zustand stores live as long as the module, so the test setup resets the store after each
test. Otherwise one test's ticks would leak into the next.

```ts
// src/testing/setup.ts
afterEach(() => {
  cleanup();
  server.resetHandlers();
  globalThis.localStorage?.clear();
  // Zustand stores live as long as the module: reset them so tests do not leak state.
  useProgressStore.getState().reset();
});
```
