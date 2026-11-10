# Gap analysis

The user sees which Java areas are missing from their CV or only weakly covered, each with a
short reason that points at what the CV did or did not contain.

## Acceptance criteria

### Gap detection (domain: `src/domain/gaps.ts`)

1. `detectGaps(ratings)` returns a gap for every area rated `none` (severity `missing`) or
   `beginner` (severity `weak`). Areas rated intermediate or higher are not gaps.
2. A missing gap's reason names the area and gives examples of what would count:
   "Your CV does not mention concurrency, for example threads, ExecutorService or
   CompletableFuture."
3. A weak gap's reason quotes the evidence that was found:
   "Your CV only mentions JUnit 5 and Mockito, which points to a beginner level."
   One item reads "only mentions X,", three or more read "X, Y and Z".
   When the coach gave a beginner score without evidence, the reason reads
   "Your CV shows little of automated testing, which points to a beginner level."
4. Missing gaps come before weak ones. Within the same severity, lower scores come first;
   equal scores keep the display order of `SKILL_AREAS`.
5. Every area has examples for AC2.

### Gaps page (`/gaps`)

6. Without a report, the page shows the "No CV analysed yet" notice.
7. With a report, the page lists every gap with the area name, a "Missing" or "Weak" badge
   and the reason, in the order of AC4.
8. When there are no gaps the page says
   "No gaps found. Every area is at least intermediate."
9. The page links to the learning path ("See your learning path", `/path`).
10. The main navigation has a "Gaps" link.

## Out of scope

- Letting the user dismiss a gap.
