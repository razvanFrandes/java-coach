# Gap analysis

The user sees which Java areas are missing from their CV or only weakly covered, each with a
short reason. The server finds the gaps, writes the reasons and sorts them
(see `docs/specs/backend.md`); the page only shows them.

## Acceptance criteria

### Gaps page (`/gaps`)

1. Without a report, the page shows the "No CV analysed yet" notice.
2. With a report, the page lists every gap in the order the server sent them, each with the
   area label, a "Missing" or "Weak" badge and the reason.
3. When there are no gaps the page says
   "No gaps found. Every area is at least intermediate."
4. The page links to the learning path ("See your learning path", `/path`).
5. The main navigation has a "Gaps" link.

## Out of scope

- Letting the user dismiss a gap.
