# Profile summary

After an upload, the user sees the coach's summary of their CV and a rating for each of the
nine Java skill areas: the level, the score and the evidence from the CV that led to it.

## Acceptance criteria

### Levels (domain: `src/domain/skill-level.ts`)

1. `levelForScore` maps a 0-100 score to a level: 0 → `none`, 1-39 → `beginner`,
   40-64 → `intermediate`, 65-84 → `advanced`, 85-100 → `expert`.
   Scores below 0 count as 0 and above 100 as 100. Fractions use the same bounds
   (39.5 is `beginner`).
2. `isLevelAtLeast(level, minimum)` says whether a level is the same as or above another,
   following the order of `SKILL_LEVELS`.
3. Every level has a label for people: "Not shown", "Beginner", "Intermediate",
   "Advanced", "Expert".

### Ratings (domain: `rateSkills`)

4. `rateSkills(report)` returns exactly one `SkillRating` per skill area, in the display order
   of `SKILL_AREAS`, with the level from AC1.
5. An area the report does not mention is rated score 0, level `none`, no evidence.
6. When the report lists an area twice, the first assessment is used.

### Mock coach

7. The mock coach uses `levelForScore` to decide which steps to suggest (refactor, no new
   behaviour): areas at advanced or above get none; intermediate areas get only the deeper step.

### Profile page (`/profile`)

8. Without a report, the page says "No CV analysed yet" and links to the upload page.
9. With a report, the page shows the coach's summary.
10. Each of the nine areas shows its name, its level label and its score out of 100.
11. Each area lists its evidence. An area without evidence says
    "Nothing in your CV mentions this yet."
12. The main navigation has a "Profile" link.

## Out of scope

- Editing the ratings by hand.
