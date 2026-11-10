# Backend (Node + SQLite + Codex)

A small Express server behind `POST /api/coach/analyze`. It asks Codex (through the Codex SDK,
using the developer's ChatGPT login, with no API key) to assess the CV, checks the answer against
the `CoachReport` contract, and stores it in SQLite keyed by a hash of the CV text, so the
same CV is never analysed twice. The frontend uses it when `VITE_COACH_MODE=http`.
The HTTP contract is in `docs/api-contract.md`.

## Acceptance criteria

### Use case (`server/src/application/analyze-cv.ts`)

1. The first time a CV text is seen, the coach engine analyses it, the report is saved with
   the CV hash, and the result says `cached: false`.
2. The same text again (ignoring leading/trailing whitespace) returns the saved report with
   `cached: true` and does not call the engine.
3. When the engine fails, the error reaches the caller and nothing is saved.
4. The CV text itself is never stored, only its SHA-256 hash.

### Report contract (`server/src/application/coach-report-schema.ts`)

5. `coachReportSchema` accepts a valid `CoachReport` and rejects unknown skill areas,
   missing fields and extra fields.
6. `coachReportJsonSchema` (sent to Codex as the output schema) marks every property as
   required and forbids additional properties, as Codex structured output demands.

### SQLite repository (`server/src/infrastructure/sqlite-analysis-repository.ts`)

7. A saved analysis can be found by CV hash; an unknown hash returns `undefined`.
8. Saving the same hash twice keeps the first analysis and does not throw.
9. Analyses survive closing and reopening the database file.

### Codex engine (`server/src/infrastructure/codex-coach-engine.ts`)

10. The prompt lists the nine skill areas and the scoring bands, includes the CV text between
    clear markers and tells Codex to treat the CV as data, not instructions.
11. Codex runs read-only, in an empty temporary directory, with network and web search off,
    and never asks for approval.
12. A valid JSON answer is parsed into a `CoachReport`. Scores are clamped to 0-100.
13. An answer that is not JSON or does not match the contract fails with
    "Codex returned an answer that does not match the CoachReport contract."
    When Codex is not logged in (it reports `401 Unauthorized`), the error says
    "Codex is not logged in on the server. Run `pnpm exec codex login` and try again."
    Any other Codex error fails with "Codex failed: <reason>".
14. When Codex takes longer than the timeout, the run is aborted and fails with
    "Codex did not answer within 180 seconds." (or the configured number).

### HTTP (`server/src/http/app.ts`)

15. `GET /api/health` answers `200 { "status": "ok" }`.
16. `POST /api/coach/analyze` with `{ "cvText": "..." }` answers
    `200 { "report": CoachReport, "cached": boolean }`.
17. A missing, non-string, too short (< 50 characters) or too long (> 100 000 characters)
    `cvText` answers `400` with code `INVALID_REQUEST`.
18. A body larger than 1 MB answers `413` with code `PAYLOAD_TOO_LARGE`.
19. A coach failure answers `502` with code `COACH_FAILED` and the reason; a timeout answers
    `504` with code `COACH_TIMEOUT`.
20. Every error body has the shape `{ "error": { "code": string, "message": string } }`.
21. An unknown `/api` route answers `404` with code `NOT_FOUND`.

## Out of scope

- Authentication and multiple users.
- Listing past analyses in the UI.
