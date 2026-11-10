# Learning path

The server sends the learning steps already in order (see `docs/specs/backend.md`). The user
ticks steps off as they finish them. Progress is saved in the browser, so it survives a reload.

## Acceptance criteria

### Saved progress (`src/features/learning-path/stores/progress-store.ts`)

1. `toggleStep(id)` marks a step done, and marks it not done when called again.
2. Completed step ids are saved in localStorage under `java-coach:learning-progress` and
   restored when the app loads. Progress is kept by step id, so it survives re-analysing the
   same CV.

### `useLearningPath` (`src/features/learning-path/hooks/use-learning-path.ts`)

3. Returns `undefined` when there is no report.
4. Returns the steps in the server's order, each with `done` and the titles of its
   prerequisites. Prerequisite ids that are not in the path are skipped.
5. Returns the progress: completed steps, total steps, percent (rounded, 0 for an empty path)
   and the hours left on the steps that are not done. Completed ids that are not in the path
   are ignored.
6. Returns `nextStep`: the first step that is not done, or `undefined` when all are done.

### Learning path page (`/path`)

7. Without a report, the page shows the "No CV analysed yet" notice.
8. The steps are a numbered list. Each shows its title, area label, goal, topics, exercise,
   effort ("6 h") and its prerequisites ("After: Threads and executors").
9. Each step has a checkbox "Mark <title> as done". Ticking it updates the progress text
   ("1 of 5 steps done").
10. When the path is empty the page says "No steps needed. Every area is already advanced."
11. The main navigation has a "Learning path" link.

## Out of scope

- Reordering steps by hand.
- Syncing progress across devices.
