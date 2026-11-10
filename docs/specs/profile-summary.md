# Profile summary

After an upload, the user sees the coach's summary of their CV and a rating for each of the
nine Java skill areas: the level, the score and the evidence from the CV that led to it.
The server computes the levels (see `docs/specs/backend.md`); the page only shows them.

## Acceptance criteria

### Labels (`src/lib/labels.ts`)

1. Every skill area has a label ("Core language", "Concurrency", ...) as listed in
   `docs/api-contract.md`.
2. Every level has a label: `none` "Not shown", `beginner` "Beginner",
   `intermediate` "Intermediate", `advanced` "Advanced", `expert` "Expert".

### Profile page (`/profile`)

3. Without a report, the page says "No CV analysed yet" and links to the upload page.
4. With a report, the page shows the coach's summary.
5. Each of the nine areas shows its label, its level label and its score out of 100
   ("55/100"), with a score bar named "<area label> score".
6. Each area lists its evidence. An area without evidence says
   "Nothing in your CV mentions this yet."
7. The main navigation has a "Profile" link.

## Out of scope

- Editing the ratings by hand.
