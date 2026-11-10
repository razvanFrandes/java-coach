# Learning path

The coach suggests learning steps. The app puts them in a sensible order (prerequisites first,
weakest areas first) and the user ticks steps off as they finish them. Progress is saved in
the browser, so it survives a reload.

## Acceptance criteria

### Ordering (domain: `src/domain/learning-path.ts`)

1. `orderLearningPath(steps, ratings)` returns every step exactly once, each after all of its
   prerequisites that are part of the path.
2. Prerequisites that are not in the path (for example a step the coach skipped because the
   area is already covered) are ignored.
3. Among the steps whose prerequisites are placed, the step in the weakest area (lowest score)
   comes next. On equal scores the coach's order wins.
4. Steps caught in a prerequisite cycle are not dropped: they are added at the end, in the
   coach's order.

### Progress (domain: `src/domain/progress.ts`)

5. `summarizeProgress(steps, completedIds)` returns completed and total steps, the percentage
   (rounded to a whole number, 0 for an empty path) and the remaining effort in hours.
   Completed ids that are not in the path are ignored.
6. `findNextStep(orderedSteps, completedIds)` returns the first step in path order that is not
   completed, or `undefined` when every step is done.

### Saved progress (Zustand store)

7. Toggling a step marks it done, toggling again marks it not done.
8. Completed step ids are saved in localStorage under `java-coach:learning-progress` and are
   restored when the app loads again. Progress is kept by step id, so it survives
   re-analysing the same CV.

### Learning path page (`/path`)

9. Without a report, the page shows the "No CV analysed yet" notice.
10. The steps are shown as a numbered list in the order of AC1-AC4. Each shows its title,
    area, goal, topics, suggested exercise, estimated effort ("6 h") and the titles of its
    prerequisites ("After: Threads and executors").
11. Each step has a checkbox "Mark <title> as done". Ticking it updates the progress text
    ("1 of 5 steps done") and the progress bar.
12. When the coach suggests no steps, the page says
    "No steps needed. Every area is already advanced."
13. The main navigation has a "Learning path" link.

## Out of scope

- Reordering steps by hand.
- Syncing progress across devices.
