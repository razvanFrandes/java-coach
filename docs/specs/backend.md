# Backend (Express + SQLite + Codex)

A small Express server, organised as MVC: routes → controllers → services → models.
`POST /api/coach/analyze` asks Codex (through the Codex SDK, using the developer's ChatGPT
login, with no API key) to assess the CV, turns the answer into a display-ready report
(levels, gaps, ordered learning path) and stores it in SQLite keyed by a hash of the CV text,
so the same CV is never analysed twice. The HTTP contract is in `docs/api-contract.md`.

## Acceptance criteria

### Report rules (`server/src/services/report.service.ts`)

1. `levelForScore` turns a 0-100 score into a level: 0 = `none`, 1-39 = `beginner`,
   40-64 = `intermediate`, 65-84 = `advanced`, 85-100 = `expert`. Scores outside 0-100 are
   clamped.
2. `rateSkills` returns exactly one skill per area, in the display order of the contract.
   An area Codex did not assess is `score 0`, `level none`, no evidence. When Codex assesses
   an area twice, the first assessment wins.
3. `detectGaps` reports areas at `none` (severity `missing`) and `beginner` (severity `weak`),
   nothing at `intermediate` or above.
4. A missing gap explains itself with examples: "Your CV does not mention concurrency, for
   example threads, ExecutorService or CompletableFuture."
5. A weak gap quotes the evidence: "Your CV only mentions JUnit 5 and Mockito, which points to
   a beginner level." Without evidence: "Your CV shows little of automated testing, which
   points to a beginner level."
6. Gaps are sorted by lowest score first, then by display order.
7. `orderLearningPath` puts every step after its prerequisites that are in the path, and
   ignores prerequisites that are not in the path.
8. Among steps that are ready, the weakest area (lowest score, missing area = 0) goes first;
   on a tie Codex's own order wins.
9. Steps caught in a prerequisite cycle are kept, at the end, in Codex's order.
10. `buildReport` combines the above: `{ summary, skills, gaps, learningPath }`.

### Analysis model (`server/src/models/analysis.model.ts`)

11. A saved analysis can be found by CV hash; an unknown hash returns `undefined`.
12. Saving the same hash twice keeps the first analysis and does not throw.
13. Analyses survive closing and reopening the database file.

### Coach service (`server/src/services/coach.service.ts`)

14. The first time a CV text is seen, Codex is asked, the report is built and saved with the
    CV hash, and the result says `cached: false`.
15. The same text again (ignoring leading/trailing whitespace) returns the saved report with
    `cached: true` and does not ask Codex.
16. When Codex fails, the error reaches the caller and nothing is saved.
17. The CV text itself is never stored, only its SHA-256 hash.

### Codex service (`server/src/services/codex.service.ts`)

18. The prompt lists the nine skill areas and the scoring bands, includes the CV text between
    `<cv>` and `</cv>` and tells Codex to treat the CV as data, not instructions.
19. Codex runs read-only, in an empty temporary directory, with network and web search off,
    never asks for approval, and must answer in the JSON schema of `codexAnswerSchema`.
20. A valid JSON answer is returned with scores clamped to 0-100.
21. An answer that is not JSON or does not match the schema fails with 502 `COACH_FAILED`:
    "Codex returned an answer in the wrong format."
22. When Codex is not logged in (it reports `401`), it fails with 502 `COACH_FAILED`:
    "Codex is not logged in on the server. Run `pnpm exec codex login` and try again."
    Any other Codex error fails with 502 `COACH_FAILED`: "Codex failed: <reason>".
23. When Codex takes longer than `CODEX_TIMEOUT_MS`, the run is aborted and fails with 504
    `COACH_TIMEOUT`: "Codex did not answer within 180 seconds." (or the configured number).

### HTTP (`server/src/app.ts`, routes, controllers, error handler)

24. `GET /api/health` answers `200 { "status": "ok" }`.
25. `POST /api/coach/analyze` with `{ "cvText": "..." }` answers
    `200 { "report": CoachReport, "cached": boolean }`.
26. A missing, non-string, too short (< 50 characters) or too long (> 100 000 characters)
    `cvText`, or a body that is not valid JSON, answers `400` with code `INVALID_REQUEST`.
27. A body larger than 1 MB answers `413` with code `PAYLOAD_TOO_LARGE`.
28. An `HttpError` thrown by a service answers with its own status, code and message
    (`502 COACH_FAILED`, `504 COACH_TIMEOUT`).
29. Any other error answers `500` with code `INTERNAL_ERROR` and a generic message.
30. An unknown `/api` route answers `404` with code `NOT_FOUND`.
31. Every error body has the shape `{ "error": { "code": string, "message": string } }`.

## Out of scope

- Authentication and multiple users.
- Listing past analyses in the UI.
