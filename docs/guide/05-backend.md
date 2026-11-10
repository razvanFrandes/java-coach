# Backend

The server in `server/src` is a classic **Express MVC** app. It has one real job: take the text
of a CV, ask Codex about it once, and send back a report the browser can show as is.

```text
server/src/
  server.ts            entry point: read .env, open the database, listen
  app.ts               the Express app: JSON body, routes, error handler
  config.ts            settings from environment variables
  db.ts                opens SQLite and creates the table
  routes/              URL -> controller
  controllers/         read the request, call a service, send the response
  services/            the work: cache, Codex, report rules
  models/              SQL queries
  schemas/             zod schemas: what a valid request / Codex answer looks like
  middlewares/         the error handler
  utils/http-error.ts  an Error that knows its HTTP status
  types.ts             the shapes the server works with
```

## A request, layer by layer

**Route**: maps a URL to a controller. Nothing else.

```ts
// server/src/routes/coach.routes.ts
export const coachRoutes = Router();

coachRoutes.post('/analyze', analyze);
```

**Controller**: checks the request, calls the service, sends the result. It contains no
business rule, so it stays a few lines long.

```ts
// server/src/controllers/coach.controller.ts
export async function analyze(req: Request, res: Response) {
  const parsed = analyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(
      400,
      'INVALID_REQUEST',
      'cvText must be a string of 50 to 100000 characters.',
    );
  }

  res.json(await analyzeCv(parsed.data.cvText));
}
```

**Services**: the actual work. `coach.service.ts` checks the cache, asks Codex and saves the
result (shown in [Data flow](/docs/data-flow)). `report.service.ts` holds the rules that turn
Codex's raw scores into what the user sees:

```ts
// server/src/services/report.service.ts
/** Turns Codex's raw answer into the report the browser shows. */
export function buildReport(answer: CodexAnswer): CoachReport {
  const skills = rateSkills(answer.assessments);
  return {
    summary: answer.summary,
    skills,
    gaps: detectGaps(skills),
    learningPath: orderLearningPath(answer.steps, skills),
  };
}

/** Turns a 0-100 score into a level. Out-of-range scores are clamped. */
export function levelForScore(score: number): SkillLevel {
  const clamped = Math.min(100, Math.max(0, score));
  if (clamped >= 85) return 'expert';
  if (clamped >= 65) return 'advanced';
  if (clamped >= 40) return 'intermediate';
  if (clamped > 0) return 'beginner';
  return 'none';
}
```

These are plain functions with no I/O, so they are easy to test and are kept at 100% coverage.

**Model**: the SQL. One function per query.

```ts
// server/src/models/analysis.model.ts
/** Saving a hash that already exists keeps the first analysis. */
export function saveAnalysis(analysis: Analysis): void {
  // Two requests for the same new CV can race; the second insert is simply ignored.
  getDb()
    .prepare(
      'INSERT INTO analyses (cv_hash, report_json, created_at) VALUES (?, ?, ?) ON CONFLICT(cv_hash) DO NOTHING',
    )
    .run(analysis.cvHash, JSON.stringify(analysis.report), analysis.createdAt);
}
```

Only a SHA-256 hash of the CV is stored, never the text, so the database holds no personal
data from the CV.

## Codex, not the OpenAI API

`codex.service.ts` uses `@openai/codex-sdk`, which runs the **Codex CLI** on the server
machine. Codex logs in with a ChatGPT account (`pnpm exec codex login`), so there is no API key
anywhere, and certainly not in the frontend.

Codex is an agent that can run commands, so it is locked down: read-only, in an empty temporary
folder, with no network and no web search. The answer must match a JSON schema built from the
zod schema in `schemas/coach.schemas.ts`.

```ts
// server/src/services/codex.service.ts
  const thread = new Codex().startThread({
    model: codexModel,
    sandboxMode: 'read-only',
    approvalPolicy: 'never',
    networkAccessEnabled: false,
    webSearchMode: 'disabled',
    workingDirectory,
    skipGitRepoCheck: true,
  });
```

Try it on its own with `pnpm codex:try [cv.pdf]`.

## Errors

Anything can `throw new HttpError(status, code, message)`. Express 5 passes errors from async
controllers to the error handler, which is the last middleware:

```ts
// server/src/app.ts
  app.use('/api', () => {
    throw new HttpError(404, 'NOT_FOUND', 'There is no such API route.');
  });
  app.use(errorHandler);
```

The handler turns every error into `{ error: { code, message } }` with the right status. The
frontend shows `message` to the user as is, so write it for a person, not for a developer.
The full list of codes is in `docs/api-contract.md`.
