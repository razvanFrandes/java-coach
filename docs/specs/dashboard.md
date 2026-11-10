# Dashboard

The home page (`/`). Before an upload it explains the app and points to the upload page.
After an upload it is the overview: skill levels, gaps, progress on the path and the next step.
No new rules: it shows the report and uses `useLearningPath`.

## Acceptance criteria

### Without a report

1. The page welcomes the user ("Welcome to Java Coach"), says what the coach does and offers
   "Upload your CV" (`/upload`) and "Download a sample CV" (`/sample-cv.pdf`).

### With a report

2. "Skill levels" is a table with every area, a score bar named "<area label> score" and the
   level label.
3. "Gaps" shows how many gaps there are ("4 gaps to work on", "1 gap to work on" or
   "No gaps") and links to `/gaps`.
4. "Learning path" shows "X of Y steps done" and the remaining hours, and links to `/path`.
5. "Next step" shows the title, goal and effort of the next step. "Mark as done" completes it
   and the card moves on to the following step.
6. When every step is done, "Next step" says "You have finished every step."
   When the path is empty it says "No steps needed."
7. "Analyse another CV" links to `/upload`.
8. The main navigation's "Dashboard" link opens `/`.

## Out of scope

- Charts beyond simple bars.
